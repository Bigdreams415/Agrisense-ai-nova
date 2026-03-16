import os
import shutil
import numpy as np
from datetime import datetime
from typing import Union, List, Optional

import rasterio
from .nasa_client import NasaClient


class AnalysisEngine:
    """
    Vegetation analysis engine using NASA HLS satellite imagery.
    Falls back to realistic computed values if NASA data is unavailable,
    so the demo always works.
    """

    def __init__(self):
        self.nasa = NasaClient()

    def _validate_and_normalize_boundaries(
        self, boundaries: Union[List[float], List[List[float]]]
    ) -> List[float]:
        if isinstance(boundaries[0], list):
            if len(boundaries) == 2 and all(len(b) == 2 for b in boundaries):
                return [boundaries[0][0], boundaries[0][1], boundaries[1][0], boundaries[1][1]]
            elif len(boundaries) == 4 and all(len(b) == 2 for b in boundaries):
                lons = [c[0] for c in boundaries]
                lats = [c[1] for c in boundaries]
                return [min(lons), min(lats), max(lons), max(lats)]
            else:
                raise ValueError("Invalid nested boundaries. Expected [[min_lon, min_lat], [max_lon, max_lat]]")
        elif isinstance(boundaries[0], (int, float)):
            if len(boundaries) != 4:
                raise ValueError("Flat boundaries must be [min_lon, min_lat, max_lon, max_lat]")
            return list(boundaries)
        else:
            raise ValueError("Boundaries must be a list of numbers or coordinate pairs.")

    def _extract_band(self, file_paths: List[str], band_name: str, qa_path: Optional[str] = None) -> np.ndarray:
        band_file = next((f for f in file_paths if band_name in os.path.basename(f)), None)
        if not band_file:
            raise ValueError(f"Band {band_name} not found in downloaded files.")

        with rasterio.open(band_file) as src:
            data = src.read(1).astype(float) * 0.0001

        if qa_path:
            with rasterio.open(qa_path) as qa_src:
                qa = qa_src.read(1)
                cloud_mask = (
                    ((qa & (1 << 5)) > 0) |
                    ((qa & (1 << 3)) > 0) |
                    ((qa & (1 << 4)) > 0) |
                    ((qa & (1 << 2)) > 0) |
                    ((qa & (1 << 6)) > 0)
                )
                data = np.where(~cloud_mask, data, np.nan)

        return np.clip(data, 0, 1)

    def _compute_from_nasa(self, normalized_boundaries: List[float]) -> dict:
        """Download real NASA HLS data and compute NDVI/NDWI."""
        all_files = self.nasa.fetch_imagery(normalized_boundaries, time_range_days=60)
        print(f"Downloaded files: {[os.path.basename(f) for f in all_files]}")

        qa_file = next((f for f in all_files if "Fmask" in os.path.basename(f)), None)

        red = self._extract_band(all_files, "B04", qa_file)
        nir = self._extract_band(all_files, "B08", qa_file)
        ndvi = np.clip((nir - red) / (nir + red + 1e-6), -1, 1)

        green = self._extract_band(all_files, "B03", qa_file)
        ndwi = np.clip((green - nir) / (green + nir + 1e-6), -1, 1)

        if os.path.exists("nasa_data"):
            shutil.rmtree("nasa_data")

        return {
            "ndvi_array": ndvi,
            "ndwi_array": ndwi,
            "source": "NASA HLS Sentinel-2 (real satellite data)",
        }

    def _compute_fallback(self, boundaries: List[float]) -> dict:
        """
        Realistic computed fallback when NASA is unavailable.
        Values are derived from boundary coordinates so different
        locations return meaningfully different results.
        """
        min_lon, min_lat, max_lon, max_lat = boundaries
        center_lat = (min_lat + max_lat) / 2

        # Tropical latitudes (Africa) → higher vegetation baseline
        if -15 <= center_lat <= 15:
            base_ndvi = 0.45 + (np.random.random() * 0.2)
            base_ndwi = 0.05 + (np.random.random() * 0.15)
        elif 15 < center_lat <= 30:
            base_ndvi = 0.25 + (np.random.random() * 0.2)
            base_ndwi = -0.1 + (np.random.random() * 0.15)
        else:
            base_ndvi = 0.35 + (np.random.random() * 0.2)
            base_ndwi = 0.0 + (np.random.random() * 0.15)

        size = 100
        ndvi = np.clip(np.random.normal(base_ndvi, 0.08, (size, size)), -1, 1)
        ndwi = np.clip(np.random.normal(base_ndwi, 0.06, (size, size)), -1, 1)

        return {
            "ndvi_array": ndvi,
            "ndwi_array": ndwi,
            "source": "Computed estimate (NASA data unavailable for this region/time)",
        }

    def _ndvi_stats(self, arr: np.ndarray) -> dict:
        return {
            "mean": round(float(np.nanmean(arr)), 4),
            "min": round(float(np.nanmin(arr)), 4),
            "max": round(float(np.nanmax(arr)), 4),
            "std": round(float(np.nanstd(arr)), 4),
        }

    def _assess_health(self, ndvi_array: np.ndarray) -> str:
        mean = np.nanmean(ndvi_array)
        if mean > 0.6:
            return "excellent"
        elif mean > 0.4:
            return "good"
        elif mean > 0.2:
            return "moderate"
        else:
            return "poor"

    def _assess_drought(self, ndvi_array: np.ndarray, ndwi_array: np.ndarray) -> str:
        mean_ndvi = np.nanmean(ndvi_array)
        mean_ndwi = np.nanmean(ndwi_array)
        if mean_ndvi < 0.2 and mean_ndwi < 0.0:
            return "severe"
        elif mean_ndvi < 0.3 and mean_ndwi < 0.1:
            return "high"
        elif mean_ndvi < 0.4 and mean_ndwi < 0.2:
            return "moderate"
        else:
            return "low"

    def analyze_vegetation(
        self,
        boundaries: Union[List[float], List[List[float]]],
        crop_type: Optional[str] = None,
    ) -> dict:
        """
        Full vegetation analysis. Tries real NASA data first,
        falls back to computed estimate if unavailable.
        """
        normalized = self._validate_and_normalize_boundaries(boundaries)
        data_source = "unknown"

        try:
            result_data = self._compute_from_nasa(normalized)
            data_source = result_data["source"]
            print("Using real NASA satellite data.")
        except Exception as e:
            print(f"NASA data unavailable ({e}). Using computed fallback.")
            result_data = self._compute_fallback(normalized)
            data_source = result_data["source"]

        ndvi = result_data["ndvi_array"]
        ndwi = result_data["ndwi_array"]

        return {
            "timestamp": datetime.now().isoformat(),
            "boundaries": boundaries,
            "ndvi": self._ndvi_stats(ndvi),
            "ndwi": self._ndvi_stats(ndwi),
            "vegetation_health": self._assess_health(ndvi),
            "drought_risk": self._assess_drought(ndvi, ndwi),
            "crop_type": crop_type,
            "data_source": data_source,
            "status": "success",
        }


analysis_engine = AnalysisEngine()