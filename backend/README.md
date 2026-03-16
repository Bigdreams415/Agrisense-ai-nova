# AgriSense AI — Nova Edition

AI-powered crop disease detection and farm intelligence platform for African smallholder farmers.
Built for the Amazon Nova AI Hackathon.

## What's inside

| Feature | Tech |
|---|---|
| Crop disease detection | CNN (98.7% accuracy, 50k PlantVillage images) |
| Irrigation recommendations | Random Forest on soil/weather sensor data |
| Yield prediction | Random Forest on historical agro data |
| AI farming advice | Amazon Nova Lite via AWS Bedrock |
| Drone/video stream analysis | RTSP/RTMP + WebSocket |
| Conversational follow-up | Amazon Nova (agentic chat with prediction context) |

## Quick start

### 1. Create project folder and copy files
```bash
mkdir agrisense-ai-nova && cd agrisense-ai-nova
# copy main.py, nova_client.py, requirements.txt, .env.example
# copy class_indices.json and disease_info.json from your old project
```

### 2. Copy your model files into models/
```bash
mkdir models
cp /path/to/finetuned_pest_detection_final.keras models/
cp /path/to/agrisense_0.63_yield_pred.pkl models/
cp /path/to/agrisense_irrigation_rf.pkl models/
cp /path/to/label_encoder.pkl models/
```
If you don't copy them, the app will auto-download from Azure using the URLs in .env.

### 3. Set up environment
```bash
cp .env.example .env
# Edit .env and fill in your AWS keys and Azure SAS URLs
```

### 4. Set up AWS Bedrock (ONE-TIME)
1. Go to https://console.aws.amazon.com/bedrock
2. Click "Model access" in the left sidebar
3. Click "Modify model access"
4. Enable: **Amazon Nova Lite** (required) and **Amazon Nova Pro** (optional)
5. Submit — access is usually granted within 2-5 minutes

### 5. Create IAM credentials for Bedrock
1. Go to IAM > Users > your user > Security credentials
2. Create access key (select "Application running outside AWS")
3. Copy Access Key ID and Secret Access Key into your .env

### 6. Install dependencies
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 7. Run
```bash
uvicorn main:app --reload --port 8000
```

Open http://localhost:8000/docs for the interactive API docs.

## API endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/predict` | Upload crop image → CNN diagnosis + Nova advice |
| POST | `/irrigation/predict` | Sensor data → irrigation ON/OFF + Nova explanation |
| POST | `/yield/predict` | Farm data → yield forecast + Nova insights |
| POST | `/chat` | Conversational AI (agentic follow-up questions) |
| POST | `/api/drones/connect` | Connect RTSP/RTMP drone stream |
| POST | `/api/jobs` | Start frame-by-frame drone analysis job |
| WS | `/ws/jobs/{job_id}` | Live WebSocket stream of drone analysis results |
| GET | `/health` | Health check |

## The Nova integration

Every prediction endpoint calls **Amazon Nova Lite** via Bedrock to replace hardcoded advice
with dynamic, context-aware guidance:

```
CNN detects: Tomato Late Blight (94.2% confidence)
        ↓
Nova generates:
  - What this disease is and how it spreads
  - Immediate actions (within 24-48 hours)
  - Treatment options (organic first, then chemical)
  - Prevention tips
  - Urgency level: HIGH
```

The `/chat` endpoint enables **agentic behaviour**: after a diagnosis, the farmer can ask
follow-up questions ("is this disease contagious to my cassava?", "where can I buy copper fungicide?")
and Nova answers with full awareness of the previous analysis.