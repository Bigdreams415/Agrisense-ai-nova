import { API_CONFIG } from './constants';

export interface SatelliteAnalysisRequest {
  boundaries: number[][];  
  crop_type: string;
  planting_date: string;
  farmer_id: string | null;
  farm_name?: string;
}

export interface InsurancePayout {
  status: 'approved' | 'already_claimed' | 'no_insurance' | 'not_eligible';
  amount_hbar?: number;
  message: string;
}

export interface HederaProof {
  consensusTimestamp: string;
  status: string;
  transactionId?: string;  
}

export interface SatelliteAnalysisResponse {
  type: string;
  status: string;
  prediction_id: string;
  result: {
    timestamp: string;
    boundaries: number[][];
    ndvi: {
      mean: number;
      min: number;
      max: number;
      std: number;
    };
    ndwi: {
      mean: number;
      min: number;
      max: number;
      std: number;
    };
    vegetation_health: string;
    drought_risk: string;
    crop_type?: string | null;
    data_source?: string;
    nova_advice?: string | null;
    powered_by?: string;
    status: string;
  };
  metadata: {
    timestamp: string;
    model_version: string;
    crop_type?: string | null;
    planting_date?: string | null;
    farmer_id?: string | null;
    latency_ms?: number;
    nova_powered?: boolean;
  };
}

export const analyzeSatelliteImagery = async (
  requestData: SatelliteAnalysisRequest
): Promise<SatelliteAnalysisResponse> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/analyze/vegetation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Satellite analysis failed:', error);
    throw new Error('Failed to analyze satellite imagery. Please try again.');
  }
};

