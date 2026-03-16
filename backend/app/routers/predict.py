import time
import uuid
import hashlib
import json
import logging
from datetime import datetime, timezone
import numpy as np
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from PIL import UnidentifiedImageError
from app.core import ml
from app.services.nova_client import nova

router = APIRouter()

@router.post("/predict")
async def predict(
    file: UploadFile = File(...),
    farmer_id: str = Form(default=None),
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload an image file.")

    prediction_id = str(uuid.uuid4())
    start_time = time.time()

    try:
        image_bytes = await file.read()
        image_hash = hashlib.sha256(image_bytes).hexdigest()
        img_array = ml.preprocess_image(image_bytes)
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Invalid image file.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image processing error: {e}")

    predictions = ml.cnn_model.predict(img_array)
    probs = predictions[0].tolist()

    top_indices = np.argsort(probs)[::-1][:3]
    main_idx = int(top_indices[0])
    main_label = ml.class_dict[main_idx]
    top_conf = float(probs[main_idx])

    is_non_plant = main_label.lower() == "non-plant" or top_conf < ml.NON_PLANT_THRESHOLD

    alternatives = [
        {
            "disease": ml.disease_info.get(ml.class_dict[int(idx)], {"disease": ml.class_dict[int(idx)]})["disease"],
            "confidence": float(probs[int(idx)]),
        }
        for idx in top_indices[1:]
    ]

    if is_non_plant:
        return {
            "status": "success",
            "prediction_id": prediction_id,
            "type": "pest_detection",
            "result": {
                "crop": "Non-plant",
                "disease": "Non-plant object",
                "confidence": top_conf,
                "advice": "This image does not appear to be a plant. Please upload a clear photo of a crop leaf.",
                "nova_advice": None,
                "urgency": None,
            },
            "alternative": [],
            "metadata": {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "farmer_id": farmer_id,
                "image_hash_sha256": image_hash,
                "latency_ms": int((time.time() - start_time) * 1000),
                "model_version": "3.0.0",
                "nova_powered": False,
            },
        }

    main_info = ml.disease_info.get(
        main_label,
        {"crop": "Unknown", "disease": main_label, "advice": "No advice available."},
    )

    # Call Nova for rich, dynamic advice
    nova_result = await nova.get_disease_advice(
        crop=main_info["crop"],
        disease=main_info["disease"],
        confidence=top_conf,
        alternatives=alternatives,
    )

    latency_ms = int((time.time() - start_time) * 1000)

    result = {
        "status": "success",
        "prediction_id": prediction_id,
        "type": "pest_detection",
        "result": {
            "crop": main_info["crop"],
            "disease": main_info["disease"],
            "confidence": top_conf,
            "nova_advice": nova_result["nova_advice"],
            "urgency": nova_result["urgency"],
            "powered_by": nova_result["powered_by"],
        },
        "alternative": alternatives,
        "metadata": {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "farmer_id": farmer_id,
            "image_filename": file.filename,
            "image_size_bytes": len(image_bytes),
            "image_hash_sha256": image_hash,
            "latency_ms": latency_ms,
            "model_version": "3.0.0",
            "nova_powered": True,
        },
    }

    logging.info(json.dumps({k: v for k, v in result.items() if k != "result"}, default=str))
    return result
