import React, { useState } from 'react';
import NovaChat from './NovaChat';
import MarkdownRenderer from '../../common/MarkdownRenderer';

interface IrrigationRequest {
  soil_moisture: number;
  temperature: number;
  air_humidity: number;
  farmer_id?: string;
}

interface IrrigationResult {
  input: {
    soil_moisture: number;
    temperature: number;
    air_humidity: number;
  };
  prediction: {
    status: 'ON' | 'OFF';
    probability_on: number;
    probability_off: number;
    recommendation: string;
    nova_advice?: string;
    powered_by?: string;
  };
  metadata?: {
    timestamp: string;
    farmer_id: string | null;
    model_version: string;
    latency_ms: number;
  };
}

const SmartIrrigation: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [irrigationResult, setIrrigationResult] = useState<IrrigationResult | null>(null);
  const [formData, setFormData] = useState({
    soil_moisture: '',
    temperature: '',
    air_humidity: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleIrrigationAnalysis = async () => {
    if (!formData.soil_moisture || !formData.temperature || !formData.air_humidity) {
      alert('Please fill in all fields');
      return;
    }

    setIsAnalyzing(true);
    try {
      const requestData: IrrigationRequest = {
        soil_moisture: parseFloat(formData.soil_moisture),
        temperature: parseFloat(formData.temperature),
        air_humidity: parseFloat(formData.air_humidity),
      };

      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${backendUrl}/irrigation/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) throw new Error('Failed to get irrigation prediction');

      const backendResult = await response.json();

      setIrrigationResult({
        input: backendResult.input,
        prediction: {
          status: backendResult.result.status,
          probability_on: backendResult.result.probability_on,
          probability_off: backendResult.result.probability_off,
          recommendation: backendResult.result.recommendation,
          nova_advice: backendResult.result.nova_advice,
          powered_by: backendResult.result.powered_by,
        },
        metadata: backendResult.metadata,
      });
    } catch (error) {
      console.error('Irrigation analysis error:', error);
      simulateIrrigationAnalysis();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const simulateIrrigationAnalysis = () => {
    setTimeout(() => {
      const soilMoisture = parseFloat(formData.soil_moisture);
      const shouldIrrigate = soilMoisture < 40;
      setIrrigationResult({
        input: {
          soil_moisture: soilMoisture,
          temperature: parseFloat(formData.temperature),
          air_humidity: parseFloat(formData.air_humidity),
        },
        prediction: {
          status: shouldIrrigate ? 'ON' : 'OFF',
          probability_on: shouldIrrigate ? 0.85 : 0.15,
          probability_off: shouldIrrigate ? 0.15 : 0.85,
          recommendation: shouldIrrigate
            ? 'Irrigate now — soil appears dry!'
            : 'No irrigation needed — soil moisture is sufficient.',
        },
      });
    }, 2000);
  };

  const getStatusColor = (status: 'ON' | 'OFF') =>
    status === 'ON' ? 'text-red-500' : 'text-green-500';

  const getStatusBgColor = (status: 'ON' | 'OFF') =>
    status === 'ON'
      ? 'bg-red-500/20 border-red-400/30'
      : 'bg-green-500/20 border-green-400/30';

  return (
    <div className="animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Input Form */}
        <div className="bg-white/80 dark:bg-gray-800/80 glass rounded-xl p-6 hover-lift">
          <h3 className="text-xl font-bold mb-4 text-blue-600 flex items-center">
            <i className="fas fa-tint mr-3 text-blue-500"></i>
            Smart Irrigation Analysis
          </h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                <i className="fas fa-seedling mr-2 text-green-500"></i>
                Soil Moisture (%)
              </label>
              <div className="relative">
                <input
                  type="number" name="soil_moisture" value={formData.soil_moisture}
                  onChange={handleInputChange} placeholder="e.g. 35"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  min="0" max="100" step="0.1"
                />
                <div className="absolute right-3 top-3 text-gray-400 text-sm">%</div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                <i className="fas fa-thermometer-half mr-2 text-red-500"></i>
                Temperature (°C)
              </label>
              <div className="relative">
                <input
                  type="number" name="temperature" value={formData.temperature}
                  onChange={handleInputChange} placeholder="e.g. 28"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  min="-50" max="60" step="0.1"
                />
                <div className="absolute right-3 top-3 text-gray-400 text-sm">°C</div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                <i className="fas fa-cloud mr-2 text-blue-400"></i>
                Air Humidity (%)
              </label>
              <div className="relative">
                <input
                  type="number" name="air_humidity" value={formData.air_humidity}
                  onChange={handleInputChange} placeholder="e.g. 65"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  min="0" max="100" step="0.1"
                />
                <div className="absolute right-3 top-3 text-gray-400 text-sm">%</div>
              </div>
            </div>

            <button
              onClick={handleIrrigationAnalysis}
              disabled={isAnalyzing || !formData.soil_moisture || !formData.temperature || !formData.air_humidity}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover-lift"
            >
              {isAnalyzing ? (
                <><i className="fas fa-spinner fa-spin mr-2"></i>Analyzing Irrigation Needs...</>
              ) : (
                <><i className="fas fa-brain mr-2"></i>Analyze Irrigation</>
              )}
            </button>
          </div>
        </div>

        {/* Results Display */}
        <div className="bg-white/80 dark:bg-gray-800/80 glass rounded-xl p-6 hover-lift">
          <h4 className="font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
            <i className="fas fa-chart-bar mr-2 text-purple-500"></i>
            Irrigation Analysis Results
          </h4>

          {!irrigationResult ? (
            <div className="text-center py-12">
              <i className="fas fa-tint text-4xl text-gray-400 mb-4"></i>
              <p className="text-gray-500 dark:text-gray-400">
                Enter soil and weather data to get irrigation recommendations
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Status Card */}
              <div className={`p-4 rounded-lg border-2 ${getStatusBgColor(irrigationResult.prediction.status)}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Irrigation Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(irrigationResult.prediction.status)} bg-white/50 dark:bg-gray-800/50`}>
                    {irrigationResult.prediction.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {irrigationResult.prediction.recommendation}
                </p>
              </div>

              {/* Probability Bars */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-red-500 font-medium">Irrigation ON</span>
                  <span className="font-semibold">{(irrigationResult.prediction.probability_on * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-red-400 to-red-600 h-3 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${irrigationResult.prediction.probability_on * 100}%` }}
                  ></div>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-green-500 font-medium">Irrigation OFF</span>
                  <span className="font-semibold">{(irrigationResult.prediction.probability_off * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${irrigationResult.prediction.probability_off * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Input Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{irrigationResult.input.soil_moisture}%</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Soil Moisture</div>
                </div>
                <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{irrigationResult.input.temperature}°C</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Temperature</div>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{irrigationResult.input.air_humidity}%</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Air Humidity</div>
                </div>
              </div>

              {/* Nova AI Advice */}
              {irrigationResult.prediction.nova_advice && (
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-700/30">
                  <h5 className="font-semibold text-green-700 dark:text-green-300 mb-2 flex items-center">
                    <i className="fas fa-robot mr-2"></i>
                    Nova AI Expert Advice
                    <span className="ml-auto text-xs text-green-500 font-normal">Powered by Amazon Nova</span>
                  </h5>
                  <MarkdownRenderer content={irrigationResult.prediction.nova_advice} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Nova Agentic Chat — above info card */}
      <NovaChat
        context={irrigationResult ? {
          crop: 'Farm',
          disease: `Irrigation ${irrigationResult.prediction.status} — ${irrigationResult.prediction.recommendation}`,
          confidence: irrigationResult.prediction.status === 'ON'
            ? irrigationResult.prediction.probability_on
            : irrigationResult.prediction.probability_off,
        } : null}
        fullContext={irrigationResult || undefined}
      />

      {/* Info Card — at the bottom */}
      <div className="bg-white/80 dark:bg-gray-800/80 glass rounded-xl p-6 mt-6 hover-lift">
        <h4 className="font-semibold mb-3 text-gray-800 dark:text-white flex items-center">
          <i className="fas fa-info-circle mr-2 text-blue-500"></i>
          How Smart Irrigation Works
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-start space-x-2">
            <i className="fas fa-seedling text-green-500 mt-1"></i>
            <div>
              <span className="font-semibold text-gray-700 dark:text-gray-300">Soil Analysis</span>
              <p>Monitors soil moisture levels to prevent over/under watering</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <i className="fas fa-thermometer-half text-red-500 mt-1"></i>
            <div>
              <span className="font-semibold text-gray-700 dark:text-gray-300">Weather Integration</span>
              <p>Considers temperature and humidity for optimal timing</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <i className="fas fa-robot text-purple-500 mt-1"></i>
            <div>
              <span className="font-semibold text-gray-700 dark:text-gray-300">Amazon Nova Advice</span>
              <p>Nova AI generates expert explanations tailored to your farm conditions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartIrrigation;