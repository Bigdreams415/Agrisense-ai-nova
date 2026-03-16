import boto3
import json
import os
import asyncio
from functools import partial
from typing import Optional
from dotenv import load_dotenv
load_dotenv()



SYSTEM_PROMPT = """You are AgriSense AI, an expert agricultural advisor helping smallholder farmers across Africa.
You provide practical, actionable advice in simple, clear language that non-expert farmers can understand.
You are empathetic, concise, and always consider that smallholder farmers have limited resources and budgets.
When you mention urgency levels, always use the exact text: Urgency Level: HIGH, Urgency Level: MEDIUM, or Urgency Level: LOW.
Never recommend products that are not accessible in rural African markets.
Always structure your responses clearly with numbered points or short sections."""


class NovaClient:
    def __init__(self):
        self.client = boto3.client(
            "bedrock-runtime",
            region_name=os.getenv("AWS_REGION", "us-east-1"),
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        )
        self.model_id = os.getenv("NOVA_MODEL_ID", "amazon.nova-lite-v1:0")

    def _invoke(self, messages: list, max_tokens: int = 1024) -> str:
        response = self.client.converse(
            modelId=self.model_id,
            system=[{"text": SYSTEM_PROMPT}],
            messages=messages,
            inferenceConfig={"maxTokens": max_tokens, "temperature": 0.7},
        )
        return response["output"]["message"]["content"][0]["text"]

    async def _async_invoke(self, messages: list, max_tokens: int = 1024) -> str:
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, partial(self._invoke, messages, max_tokens))

    async def get_disease_advice(
        self,
        crop: str,
        disease: str,
        confidence: float,
        alternatives: list,
    ) -> dict:
        is_healthy = "healthy" in disease.lower()
        alt_text = ""
        if alternatives:
            alt_list = ", ".join(
                [f"{a['disease']} ({a['confidence'] * 100:.1f}%)" for a in alternatives]
            )
            alt_text = f"\nOther possible conditions considered: {alt_list}"

        if is_healthy:
            prompt = f"""A crop disease detection AI analyzed a farmer's {crop} plant image.
Result: The plant appears HEALTHY (confidence: {confidence * 100:.1f}%){alt_text}

Please provide:
1. Confirmation of what a healthy {crop} plant looks like
2. Preventive care tips to maintain this health
3. Early warning signs the farmer should watch for
4. Seasonal care advice

Keep your advice practical for a smallholder farmer in Africa.
End with: Urgency Level: LOW"""
        else:
            prompt = f"""A crop disease detection AI (98.7% accuracy) analyzed a farmer's crop image and detected:
- Crop: {crop}
- Detected Condition: {disease}
- Confidence: {confidence * 100:.1f}%{alt_text}

Please provide:
1. What is this disease/condition and how it spreads
2. Immediate actions (within 24-48 hours)
3. Treatment options — list affordable/organic options first, then chemical if needed
4. Prevention tips for future seasons
5. Whether nearby crops are at risk

End your response with one of these exact lines:
Urgency Level: HIGH  (if the disease spreads fast or destroys yield quickly)
Urgency Level: MEDIUM  (if treatment is needed but farmer has a few days)
Urgency Level: LOW  (if the condition is minor or manageable)

Keep advice practical for a smallholder farmer in Africa."""

        messages = [{"role": "user", "content": [{"text": prompt}]}]
        advice_text = await self._async_invoke(messages, 1200)

        urgency = "MEDIUM"
        lower = advice_text.lower()
        if "urgency level: high" in lower:
            urgency = "HIGH"
        elif "urgency level: low" in lower:
            urgency = "LOW"

        return {
            "nova_advice": advice_text,
            "urgency": urgency,
            "powered_by": "Amazon Nova Lite via AWS Bedrock",
        }

    async def get_irrigation_advice(
        self,
        soil_moisture: float,
        temperature: float,
        air_humidity: float,
        recommendation: str,
        probability: float,
    ) -> dict:
        prompt = f"""Farm sensor data was analyzed by an irrigation AI model:
- Soil Moisture: {soil_moisture}%
- Temperature: {temperature}°C
- Air Humidity: {air_humidity}%
- AI Recommendation: Turn irrigation {recommendation} (model confidence: {probability * 100:.1f}%)

Please explain to the farmer:
1. Why this recommendation makes sense given the sensor readings
2. {"Best time of day and duration to irrigate" if recommendation == "ON" else "When to check soil moisture again"}
3. What soil moisture level should trigger the next irrigation
4. Any concern about the current temperature or humidity readings
5. One practical tip to conserve water or protect the crop today

Keep your advice short and practical for a smallholder farmer."""

        messages = [{"role": "user", "content": [{"text": prompt}]}]
        advice_text = await self._async_invoke(messages, 800)

        return {
            "nova_advice": advice_text,
            "powered_by": "Amazon Nova Lite via AWS Bedrock",
        }

    async def get_yield_insights(
        self,
        area: str,
        crop: str,
        year: int,
        predicted_yield: float,
        rainfall: float,
        temperature: float,
        pesticides: float,
    ) -> dict:
        # Convert hg/ha to tonnes/ha for readability
        tonnes_per_ha = round(predicted_yield / 10000, 2)

        prompt = f"""An AI yield prediction model has estimated the following harvest:
- Region: {area}
- Crop: {crop}
- Season Year: {year}
- Predicted Yield: {predicted_yield} hg/ha ({tonnes_per_ha} tonnes/ha)
- Annual Rainfall: {rainfall} mm
- Average Temperature: {temperature}°C
- Pesticides Applied: {pesticides} tonnes

Please provide:
1. Is this yield good, average, or below average for {crop} farming in Africa? Give context.
2. The biggest factor currently affecting this yield (positive or negative)
3. Top 3 actionable steps to improve yield next season
4. Any climate risk based on the rainfall ({rainfall}mm) and temperature ({temperature}°C)
5. Best time to harvest and whether to sell immediately or store

Keep the response practical and motivating for a smallholder farmer."""

        messages = [{"role": "user", "content": [{"text": prompt}]}]
        advice_text = await self._async_invoke(messages, 1000)

        return {
            "nova_advice": advice_text,
            "powered_by": "Amazon Nova Lite via AWS Bedrock",
        }

    async def get_satellite_insights(
        self,
        vegetation_health: str,
        drought_risk: str,
        ndvi_mean: float,
        ndwi_mean: float,
        crop_type: Optional[str],
        boundaries: list,
    ) -> dict:
        crop_label = crop_type if crop_type else "general crops"

        prompt = f"""AgriSense AI satellite imagery analysis returned the following results for a farm:

- Crop Type: {crop_label}
- Vegetation Health (NDVI): {vegetation_health.upper()} (NDVI mean = {ndvi_mean:.3f})
- Drought Risk (NDWI): {drought_risk.upper()} (NDWI mean = {ndwi_mean:.3f})

NDVI scale: -1 to 1 (above 0.6 = excellent, 0.4-0.6 = good, 0.2-0.4 = moderate, below 0.2 = poor)
NDWI scale: positive = water present, negative = drought stress

Please provide:
1. What these satellite readings mean for this {crop_label} farm in practical terms
2. Immediate actions the farmer should take based on vegetation health
3. Irrigation recommendation based on drought risk level
4. Whether a drone inspection is recommended and which part of the farm to focus on
5. One key tip to improve vegetation health before next satellite pass

Keep your advice practical and actionable for a smallholder farmer in Africa."""

        messages = [{"role": "user", "content": [{"text": prompt}]}]
        advice_text = await self._async_invoke(messages, 1000)

        return {
            "nova_advice": advice_text,
            "powered_by": "Amazon Nova Lite via AWS Bedrock",
        }

    async def chat(self, messages: list, context: Optional[dict] = None) -> str:
        """
        Conversational follow-up — farmer can ask anything after a prediction.
        The context dict (a previous prediction result) is injected so Nova
        can answer in full awareness of what was already diagnosed.
        """
        formatted = []

        if context and messages:
            context_summary = json.dumps(context, indent=2)
            first_text = messages[0]["content"][0]["text"]
            injected_text = (
                f"[Previous AgriSense analysis for context:\n{context_summary}]\n\n"
                f"Farmer's question: {first_text}"
            )
            formatted.append(
                {"role": "user", "content": [{"text": injected_text}]}
            )
            formatted.extend(messages[1:])
        else:
            formatted = messages

        return await self._async_invoke(formatted, 1024)


# Singleton — imported everywhere
nova = NovaClient()