import time
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter
from app.schemas.requests import YieldRequest
from app.core import ml
from app.services.nova_client import nova

router = APIRouter()

@router.post("/yield/predict")
async def predict_yield(payload: YieldRequest):
    prediction_id = str(uuid.uuid4())
    start_time = time.time()

    df = ml.prepare_yield_features(payload.model_dump() if hasattr(payload, 'model_dump') else payload.dict())
    predicted_yield = round(float(ml.yield_model.predict(df)[0]), 2)

    nova_result = await nova.get_yield_insights(
        area=payload.Area,
        crop=payload.crop_type,
        year=payload.Year,
        predicted_yield=predicted_yield,
        rainfall=payload.average_rain_fall_mm_per_year,
        temperature=payload.avg_temp,
        pesticides=payload.pesticides_tonnes,
    )

    return {
        "status": "success",
        "prediction_id": prediction_id,
        "type": "yield_prediction",
        "result": {
            "Area": payload.Area,
            "Year": payload.Year,
            "Crop_Type": payload.crop_type,
            "Predicted_Yield_hg_per_ha": predicted_yield,
            "Predicted_Yield_tonnes_per_ha": round(predicted_yield / 10000, 2),
            "nova_advice": nova_result["nova_advice"],
            "powered_by": nova_result["powered_by"],
        },
        "metadata": {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "farmer_id": payload.farmer_id,
            "latency_ms": int((time.time() - start_time) * 1000),
            "model_version": "3.0.0",
            "nova_powered": True,
        },
    }
