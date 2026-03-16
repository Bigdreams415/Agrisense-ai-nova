import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import health, predict, irrigation, yield_api, satellite, chat, drones
# App setup
app = FastAPI(title="AgriSense AI — Nova Edition", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOG_FILE = os.path.join(BASE_DIR, "predictions.log")

logging.basicConfig(
    filename=LOG_FILE,
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)

# Include Routers
app.include_router(health.router)
app.include_router(predict.router)
app.include_router(irrigation.router)
app.include_router(yield_api.router)
app.include_router(satellite.router)
app.include_router(chat.router)
app.include_router(drones.router)
