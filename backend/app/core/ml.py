import os
import json
import logging
import joblib
import numpy as np
import pandas as pd
import requests
import tensorflow as tf
from PIL import Image
from io import BytesIO

# ---------------------------------------------------------------------------
# Setup logging
# ---------------------------------------------------------------------------
# We are currently in backend/app/core/ml.py
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODELS_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODELS_DIR, exist_ok=True)
DATA_DIR = os.path.join(BASE_DIR, "data")

tf.get_logger().setLevel("ERROR")

# ---------------------------------------------------------------------------
# Model paths & Azure fallback URLs (set in .env)
# ---------------------------------------------------------------------------
CNN_LOCAL = os.path.join(MODELS_DIR, "finetuned_pest_detection_final.keras")
YIELD_LOCAL = os.path.join(MODELS_DIR, "agrisense_0.63_yield_pred.pkl")
IRRIGATION_LOCAL = os.path.join(MODELS_DIR, "agrisense_irrigation_rf.pkl")
LABEL_ENCODER_LOCAL = os.path.join(MODELS_DIR, "label_encoder.pkl")

CNN_AZURE_URL = os.getenv("CNN_AZURE_URL", "")
YIELD_AZURE_URL = os.getenv("YIELD_AZURE_URL", "")
IRRIGATION_AZURE_URL = os.getenv("IRRIGATION_AZURE_URL", "")
LABEL_ENCODER_AZURE_URL = os.getenv("LABEL_ENCODER_AZURE_URL", "")

def download_from_azure(url: str, dest: str, label: str):
    """Download a file from Azure Blob Storage (SAS URL) to local disk."""
    if not url:
        raise RuntimeError(
            f"No Azure URL configured for {label}. "
            "Set the corresponding env variable or place the file in models/."
        )
    print(f"Downloading {label} from Azure Blob Storage...")
    response = requests.get(url, stream=True, timeout=120)
    if response.status_code != 200:
        raise RuntimeError(
            f"Failed to download {label}: HTTP {response.status_code}"
        )
    with open(dest, "wb") as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
    print(f"{label} downloaded successfully.")

def ensure_file(local_path: str, azure_url: str, label: str):
    if not os.path.exists(local_path):
        download_from_azure(azure_url, local_path, label)

# ---------------------------------------------------------------------------
# State Variables
# ---------------------------------------------------------------------------
cnn_model = None
class_dict = {}
disease_info = {}
yield_model = None
yield_label_encoder = None
irrigation_model = None
irrigation_scaler = None
IRRIGATION_FEATURES = []

YIELD_FEATURES = [
    "Area", "Year", "average_rain_fall_mm_per_year", "pesticides_tonnes",
    "avg_temp", "rain_lag", "pest_temp_interact", "rain_pest_interact",
    "Item_1", "Item_2", "Item_3", "Item_4", "Item_5", "Item_6", "Item_7", "Item_8", "Item_9",
]

CROP_MAP = {
    "maize":     [1,0,0,0,0,0,0,0,0],
    "rice":      [0,1,0,0,0,0,0,0,0],
    "cassava":   [0,0,1,0,0,0,0,0,0],
    "yam":       [0,0,0,1,0,0,0,0,0],
    "groundnut": [0,0,0,0,1,0,0,0,0],
    "sorghum":   [0,0,0,0,0,1,0,0,0],
    "millet":    [0,0,0,0,0,0,1,0,0],
    "beans":     [0,0,0,0,0,0,0,1,0],
    "wheat":     [0,0,0,0,0,0,0,0,1],
}

NON_PLANT_THRESHOLD = 0.6

# ---------------------------------------------------------------------------
# Load Methods
# ---------------------------------------------------------------------------
def load_all_models():
    global cnn_model, class_dict, disease_info
    global yield_model, yield_label_encoder
    global irrigation_model, irrigation_scaler, IRRIGATION_FEATURES
    
    print("Loading models...")
    # CNN Model
    ensure_file(CNN_LOCAL, CNN_AZURE_URL, "CNN pest detection model")
    try:
        cnn_model = tf.keras.models.load_model(CNN_LOCAL)
        with open(os.path.join(DATA_DIR, "class_indices.json")) as f:
            class_indices = json.load(f)
        class_dict = {v: k for k, v in class_indices.items()}
        with open(os.path.join(DATA_DIR, "disease_info.json")) as f:
            disease_info = json.load(f)
        print("CNN model loaded successfully.")
    except Exception as e:
        print(f"Warning/Failed to load CNN model: {e}")

    # Yield Model
    ensure_file(YIELD_LOCAL, YIELD_AZURE_URL, "Yield prediction model")
    ensure_file(LABEL_ENCODER_LOCAL, LABEL_ENCODER_AZURE_URL, "Label encoder")
    try:
        yield_bundle = joblib.load(YIELD_LOCAL)
        yield_model = yield_bundle["model"]
        yield_label_encoder = joblib.load(LABEL_ENCODER_LOCAL)
        print("Yield model loaded successfully.")
    except Exception as e:
        print(f"Warning/Failed to load yield model: {e}")

    # Irrigation Model
    ensure_file(IRRIGATION_LOCAL, IRRIGATION_AZURE_URL, "Irrigation model")
    try:
        irrigation_bundle = joblib.load(IRRIGATION_LOCAL)
        irrigation_model = irrigation_bundle["model"]
        irrigation_scaler = irrigation_bundle["scaler"]
        IRRIGATION_FEATURES = irrigation_bundle["features"]
        print("Irrigation model loaded successfully.")
    except Exception as e:
        print(f"Warning/Failed to load irrigation model: {e}")

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def preprocess_image(image_bytes: bytes) -> np.ndarray:
    image = Image.open(BytesIO(image_bytes)).convert("RGB")
    resized = image.resize((224, 224))
    arr = np.asarray(resized)
    return np.expand_dims(arr, axis=0) / 255.0

def prepare_yield_features(data: dict) -> pd.DataFrame:
    df = pd.DataFrame([{
        "Area": data.get("Area", ""),
        "Year": data.get("Year", 0),
        "avg_temp": data.get("avg_temp", 0.0),
        "average_rain_fall_mm_per_year": data.get("average_rain_fall_mm_per_year", 0.0),
        "pesticides_tonnes": data.get("pesticides_tonnes", 0.0),
    }])

    df["rain_lag"] = df["average_rain_fall_mm_per_year"] * 0.08
    df["pest_temp_interact"] = df["avg_temp"] * df["pesticides_tonnes"]
    df["rain_pest_interact"] = df["average_rain_fall_mm_per_year"] * df["pesticides_tonnes"]

    item_vals = CROP_MAP.get(data.get("crop_type", "").lower(), [0] * 9)
    for i, val in enumerate(item_vals, 1):
        df[f"Item_{i}"] = val

    area = df.at[0, "Area"]
    if area not in yield_label_encoder.classes_:
        yield_label_encoder.classes_ = np.append(yield_label_encoder.classes_, area)
    df["Area"] = yield_label_encoder.transform([area])

    return df.reindex(columns=YIELD_FEATURES, fill_value=0.0)

load_all_models()
