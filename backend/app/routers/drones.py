import uuid
import asyncio
import base64
import subprocess
from datetime import datetime
from io import BytesIO
import httpx
from fastapi import APIRouter, HTTPException, BackgroundTasks, WebSocket, WebSocketDisconnect

from app.schemas.requests import DroneConnectRequest, JobCreateRequest
from app.core.state import drones, jobs, frame_history

router = APIRouter()

@router.post("/api/drones/connect")
async def connect_drone(request: DroneConnectRequest):
    drone_id = str(uuid.uuid4())

    try:
        if request.method == "rtsp":
            cmd = [
                "ffmpeg", "-timeout", "8000000", "-rtsp_transport", "tcp",
                "-i", request.url, "-t", "2", "-frames", "1", "-f", "null", "-",
            ]
            result = subprocess.run(cmd, capture_output=True, timeout=10, text=True)
            if result.returncode != 0:
                raise ValueError("RTSP stream unreachable.")

        elif request.method != "rtmp":
            raise ValueError("method must be 'rtsp' or 'rtmp'.")

        drones[drone_id] = {
            "method": request.method,
            "url": request.url,
            "status": "connected",
            "connected_at": datetime.now().isoformat(),
        }
        return {"drone_id": drone_id, "status": "connected"}

    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=400, detail="RTSP connection timed out.")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/api/jobs")
async def create_job(request: JobCreateRequest, background_tasks: BackgroundTasks):
    if request.drone_id not in drones:
        raise HTTPException(status_code=404, detail="Drone not found.")

    job_id = str(uuid.uuid4())
    jobs[job_id] = {
        "drone_id": request.drone_id,
        "interval_s": request.interval_s,
        "farmer_id": request.farmer_id,
        "active": True,
        "ws_clients": [],
        "last_frame_ts": None,
        "created_at": datetime.now().isoformat(),
    }

    background_tasks.add_task(start_frame_loop, job_id)
    return {
        "job_id": job_id,
        "ws_url": f"ws://localhost:8000/ws/jobs/{job_id}",
        "status": "started",
    }


async def start_frame_loop(job_id: str):
    job = jobs[job_id]
    drone = drones[job["drone_id"]]
    url, method = drone["url"], drone["method"]
    frame_count = 0
    failures = 0

    while job["active"]:
        try:
            frame_count += 1
            timestamp = datetime.now().isoformat()
            frame_id = f"{job_id}-frame-{frame_count}"

            cmd = (
                ["ffmpeg", "-y", "-rtsp_transport", "tcp", "-i", url,
                 "-frames:v", "1", "-qscale:v", "5", "-f", "image2pipe", "-vcodec", "mjpeg", "pipe:1"]
                if method == "rtsp" else
                ["ffmpeg", "-y", "-i", url,
                 "-frames:v", "1", "-qscale:v", "5", "-f", "image2pipe", "-vcodec", "mjpeg", "pipe:1"]
            )

            proc = subprocess.run(cmd, capture_output=True, timeout=15)

            if proc.returncode == 0 and len(proc.stdout) > 5000:
                failures = 0
                frame_bytes = proc.stdout
                frame_file = BytesIO(frame_bytes)

                ml_response = await call_ml_inference(frame_file, job_id, timestamp)
                thumbnail = base64.b64encode(frame_bytes).decode("utf-8")

                frame_history[frame_id] = {**ml_response, "timestamp": timestamp, "thumbnail_b64": thumbnail}

                # We iterate over a copy of ws_clients to allow safe removal during iteration
                for client in list(job["ws_clients"]):
                    try:
                        await client.send_json({
                            "type": "frame_result",
                            "frame_id": frame_id,
                            "timestamp": timestamp,
                            "thumbnail_b64": thumbnail,
                            **ml_response,
                        })
                    except Exception:
                        if client in job["ws_clients"]:
                            job["ws_clients"].remove(client)

                job["last_frame_ts"] = timestamp
            else:
                failures += 1

        except Exception:
            failures += 1

        if failures >= 5:
            job["active"] = False
            break

        await asyncio.sleep(job["interval_s"])


async def call_ml_inference(frame_file: BytesIO, job_id: str, timestamp: str) -> dict:
    try:
        frame_file.seek(0)
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "http://127.0.0.1:8000/predict",
                files={"file": ("drone_frame.jpg", frame_file, "image/jpeg")},
                data={"farmer_id": jobs.get(job_id, {}).get("farmer_id")},
                timeout=30.0,
            )
        if response.status_code == 200:
            r = response.json()
            return {
                "status": r.get("status"),
                "prediction_id": r.get("prediction_id"),
                "result": r.get("result"),
                "alternative": r.get("alternative"),
                "disease": r.get("result", {}).get("disease"),
                "confidence": r.get("result", {}).get("confidence"),
                "nova_advice": r.get("result", {}).get("nova_advice"),
                "urgency": r.get("result", {}).get("urgency"),
            }
    except Exception:
        pass
    return {"status": "error", "disease": "inference_error", "confidence": 0.0}


@router.websocket("/ws/jobs/{job_id}")
async def ws_job(websocket: WebSocket, job_id: str):
    await websocket.accept()
    if job_id not in jobs:
        await websocket.close(code=1008, reason="Job not found")
        return
    jobs[job_id]["ws_clients"].append(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        if job_id in jobs and websocket in jobs[job_id]["ws_clients"]:
            jobs[job_id]["ws_clients"].remove(websocket)


@router.post("/api/jobs/{job_id}/stop")
async def stop_job(job_id: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    jobs[job_id]["active"] = False
    for client in list(jobs[job_id]["ws_clients"]):
        try:
            await client.close()
        except Exception:
            pass
    jobs[job_id]["ws_clients"] = []
    return {"status": "stopped", "job_id": job_id}


@router.delete("/api/jobs/{job_id}")
async def delete_job(job_id: str):
    if job_id in jobs:
        jobs[job_id]["active"] = False
        for client in list(jobs[job_id]["ws_clients"]):
            try:
                await client.close()
            except Exception:
                pass
        del jobs[job_id]
    return {"status": "deleted", "job_id": job_id}


@router.get("/api/jobs/{job_id}/frames")
async def get_frames(job_id: str):
    matching = {k: v for k, v in frame_history.items() if k.startswith(job_id)}
    return {"job_id": job_id, "frame_count": len(matching), "frames": matching}
