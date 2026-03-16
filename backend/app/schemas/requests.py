from typing import List, Optional, Union
from pydantic import BaseModel, field_validator

class YieldRequest(BaseModel):
    Area: str
    Year: int
    avg_temp: float
    average_rain_fall_mm_per_year: float
    pesticides_tonnes: float
    crop_type: str
    farmer_id: Optional[str] = None

class IrrigationRequest(BaseModel):
    soil_moisture: float
    temperature: float
    air_humidity: float
    farmer_id: Optional[str] = None

class SatelliteRequest(BaseModel):
    boundaries: Union[List[List[float]], List[float]]
    crop_type: Optional[str] = None
    planting_date: Optional[str] = None
    farmer_id: Optional[str] = None

    @field_validator("boundaries")
    @classmethod # Note: added classmethod for Pydantic v2 compatibility, if not present
    def validate_boundaries(cls, value):
        if (
            isinstance(value, list)
            and len(value) == 4
            and all(isinstance(item, (int, float)) for item in value)
        ):
            value = [
                [float(value[0]), float(value[1])],
                [float(value[2]), float(value[3])],
            ]

        if not value or len(value) != 2:
            raise ValueError("Boundaries must be [[min_lon, min_lat], [max_lon, max_lat]]")

        for coord in value:
            if len(coord) != 2:
                raise ValueError("Each coordinate pair must have 2 values")

            lon, lat = float(coord[0]), float(coord[1])
            if not (-180 <= lon <= 180):
                raise ValueError("Longitude must be between -180 and 180")
            if not (-90 <= lat <= 90):
                raise ValueError("Latitude must be between -90 and 90")

        if value[0][0] >= value[1][0] or value[0][1] >= value[1][1]:
            raise ValueError("min_lon/min_lat must be less than max_lon/max_lat")

        return value

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    context: Optional[dict] = None

class DroneConnectRequest(BaseModel):
    method: str
    url: str

class JobCreateRequest(BaseModel):
    drone_id: str
    interval_s: int
    farmer_id: Optional[str] = None
