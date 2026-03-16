import time
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from app.schemas.requests import SatelliteRequest
from app.satellite.analysis_engine import AnalysisEngine
from app.services.nova_client import nova

router = APIRouter()

analysis_engine = AnalysisEngine()

@router.post("/analyze/vegetation")
async def analyze_vegetation(request: SatelliteRequest):
    """
    Satellite vegetation analysis powered by NASA HLS imagery + Amazon Nova insights.
    Returns NDVI (vegetation health), NDWI (drought risk), and Nova-generated farm advice.
    """
    try:
        prediction_id = str(uuid.uuid4())
        start_time = time.time()

        print(f"Starting satellite analysis for boundaries: {request.boundaries}")
        raw_result = analysis_engine.analyze_vegetation(
            boundaries=request.boundaries,
            crop_type=request.crop_type,
        )

        nova_result = await nova.get_satellite_insights(
            vegetation_health=raw_result["vegetation_health"],
            drought_risk=raw_result["drought_risk"],
            ndvi_mean=raw_result["ndvi"]["mean"],
            ndwi_mean=raw_result["ndwi"]["mean"],
            crop_type=request.crop_type,
            boundaries=request.boundaries,
        )

        return {
            "status": "success",
            "prediction_id": prediction_id,
            "type": "satellite_imagery",
            "result": {
                **raw_result,
                "nova_advice": nova_result["nova_advice"],
                "powered_by": nova_result["powered_by"],
            },
            "metadata": {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "farmer_id": request.farmer_id,
                "crop_type": request.crop_type,
                "planting_date": request.planting_date,
                "latency_ms": int((time.time() - start_time) * 1000),
                "model_version": "3.0.0",
                "nova_powered": True,
            },
        }

    except Exception as e:
        print(f"Satellite analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Satellite analysis failed: {str(e)}")
