import time
import uuid
from datetime import datetime, timezone
import pandas as pd
from fastapi import APIRouter
from app.schemas.requests import IrrigationRequest
from app.core import ml
from app.services.nova_client import nova

router = APIRouter()

@router.post("/irrigation/predict")
async def predict_irrigation(payload: IrrigationRequest):
    prediction_id = str(uuid.uuid4())
    start_time = time.time()

    data = pd.DataFrame([{
        "Soil Moisture": payload.soil_moisture,
        "Temperature": payload.temperature,
        "Air Humidity": payload.air_humidity,
    }])

    scaled = ml.irrigation_scaler.transform(data[ml.IRRIGATION_FEATURES])
    proba_on = float(ml.irrigation_model.predict_proba(scaled)[0][1])
    proba_off = 1.0 - proba_on
    recommendation = "ON" if proba_on > 0.5 else "OFF"

    nova_result = await nova.get_irrigation_advice(
        soil_moisture=payload.soil_moisture,
        temperature=payload.temperature,
        air_humidity=payload.air_humidity,
        recommendation=recommendation,
        probability=proba_on if recommendation == "ON" else proba_off,
    )

    return {
        "status": "success",
        "prediction_id": prediction_id,
        "type": "irrigation_recommendation",
        "result": {
            "status": recommendation,
            "probability_on": round(proba_on, 3),
            "probability_off": round(proba_off, 3),
            "recommendation": (
                "Irrigate now — soil appears dry." if recommendation == "ON"
                else "No irrigation needed — soil moisture is sufficient."
            ),
            "nova_advice": nova_result["nova_advice"],
            "powered_by": nova_result["powered_by"],
        },
        "input": {
            "soil_moisture": payload.soil_moisture,
            "temperature": payload.temperature,
            "air_humidity": payload.air_humidity,
        },
        "metadata": {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "farmer_id": payload.farmer_id,
            "latency_ms": int((time.time() - start_time) * 1000),
            "model_version": "3.0.0",
            "nova_powered": True,
        },
    }
