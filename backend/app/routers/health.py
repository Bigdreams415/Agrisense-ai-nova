import os
from fastapi import APIRouter
from app.core import ml

router = APIRouter()

@router.get("/")
async def root():
    return {
        "app": "AgriSense AI — Nova Edition",
        "version": "3.0.0",
        "models": ["pest_detection_cnn", "irrigation_rf", "yield_rf"],
        "ai_advisor": "Amazon Nova Lite via AWS Bedrock",
        "status": "active",
    }

@router.get("/health")
async def health():
    return {
        "status": "ok",
        "cnn_loaded": ml.cnn_model is not None,
        "yield_model_loaded": ml.yield_model is not None,
        "irrigation_model_loaded": ml.irrigation_model is not None,
        "nova_model": os.getenv("NOVA_MODEL_ID", "amazon.nova-lite-v1:0"),
    }
