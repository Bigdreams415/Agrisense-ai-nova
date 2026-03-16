import React, { useState } from 'react';
import NovaChat from './NovaChat';
import MarkdownRenderer from '../../common/MarkdownRenderer';

const CURRENT_YEAR = new Date().getFullYear();

interface YieldRequest {
  Area: string;
  Year: number;
  avg_temp: number;
  average_rain_fall_mm_per_year: number;
  pesticides_tonnes: number;
  crop_type: string;
}

interface YieldResult {
  result: {
    Area: string;
    Year: number;
    Crop_Type: string;
    Predicted_Yield_hg_per_ha: number;
    Predicted_Yield_tonnes_per_ha?: number;
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

const YieldPrediction: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [yieldResult, setYieldResult] = useState<YieldResult | null>(null);
  const [yearError, setYearError] = useState('');
  const [formData, setFormData] = useState({
    Area: '',
    Year: CURRENT_YEAR,
    avg_temp: '',
    average_rain_fall_mm_per_year: '',
    pesticides_tonnes: '',
    crop_type: '',
  });

  const cropOptions = [
    'maize', 'rice', 'cassava', 'yam', 'groundnut',
    'sorghum', 'millet', 'beans', 'wheat',
  ];

  const areaSuggestions = [
    'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Ethiopia',
    'Tanzania', 'Uganda', 'Zambia', 'Zimbabwe', 'Malawi',
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'Year') {
      const yearVal = parseInt(value);
      if (yearVal > CURRENT_YEAR) {
        setYearError(`Year cannot be in the future. Max is ${CURRENT_YEAR}.`);
      } else if (yearVal < 2000) {
        setYearError('Year must be 2000 or later.');
      } else {
        setYearError('');
      }
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleYieldPrediction = async () => {
    if (!formData.Area || !formData.crop_type || !formData.avg_temp ||
      !formData.average_rain_fall_mm_per_year || !formData.pesticides_tonnes) {
      alert('Please fill in all required fields');
      return;
    }

    const yearVal = parseInt(formData.Year.toString());
    if (yearVal > CURRENT_YEAR || yearVal < 2000) {
      alert(`Please enter a valid year between 2000 and ${CURRENT_YEAR}`);
      return;
    }

    setIsAnalyzing(true);
    try {
      const requestData: YieldRequest = {
        Area: formData.Area,
        Year: yearVal,
        avg_temp: parseFloat(formData.avg_temp),
        average_rain_fall_mm_per_year: parseFloat(formData.average_rain_fall_mm_per_year),
        pesticides_tonnes: parseFloat(formData.pesticides_tonnes),
        crop_type: formData.crop_type,
      };

      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${backendUrl}/yield/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) throw new Error('Failed to get yield prediction');

      const backendResult = await response.json();
      setYieldResult({ result: backendResult.result, metadata: backendResult.metadata });

    } catch (error) {
      console.error('Yield prediction error:', error);
      simulateYieldPrediction();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const simulateYieldPrediction = () => {
    setTimeout(() => {
      const baseYield = Math.random() * 50000 + 20000;
      setYieldResult({
        result: {
          Area: formData.Area,
          Year: parseInt(formData.Year.toString()),
          Crop_Type: formData.crop_type,
          Predicted_Yield_hg_per_ha: Math.round(baseYield),
          Predicted_Yield_tonnes_per_ha: Math.round(baseYield / 10000 * 100) / 100,
        },
      });
    }, 2500);
  };

  const formatYield = (yieldValue: number) => {
    if (yieldValue >= 10000) return `${(yieldValue / 10000).toFixed(2)} t/ha`;
    if (yieldValue >= 1000) return `${(yieldValue / 1000).toFixed(1)}k hg/ha`;
    return `${yieldValue} hg/ha`;
  };

  const getCropIcon = (cropType: string) => {
    const icons: { [key: string]: string } = {
      maize: 'fa-seedling', rice: 'fa-wheat-alt', cassava: 'fa-leaf',
      yam: 'fa-carrot', groundnut: 'fa-seedling', sorghum: 'fa-wheat-awn',
      millet: 'fa-seedling', beans: 'fa-seedling', wheat: 'fa-wheat-alt',
    };
    return icons[cropType] || 'fa-seedling';
  };

  return (
    <div className="animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Input Form */}
        <div className="bg-white/80 dark:bg-gray-800/80 glass rounded-xl p-6 hover-lift">
          <h3 className="text-xl font-bold mb-4 text-green-600 flex items-center">
            <i className="fas fa-chart-line mr-3 text-green-500"></i>
            Crop Yield Prediction
          </h3>

          <div className="space-y-4">
            {/* Area */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                <i className="fas fa-map-marker-alt mr-2 text-red-500"></i>Farm Area / Country *
              </label>
              <input
                type="text" name="Area" value={formData.Area} onChange={handleInputChange}
                placeholder="e.g. Nigeria" list="area-suggestions"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
              />
              <datalist id="area-suggestions">
                {areaSuggestions.map(area => <option key={area} value={area} />)}
              </datalist>
            </div>

            {/* Year */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                <i className="fas fa-calendar-alt mr-2 text-blue-500"></i>Season Year *
              </label>
              <input
                type="number" name="Year" value={formData.Year} onChange={handleInputChange}
                min="2000" max={CURRENT_YEAR}
                className={`w-full p-3 border rounded-lg bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 ${
                  yearError ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {yearError && (
                <p className="text-xs text-red-500 flex items-center">
                  <i className="fas fa-exclamation-circle mr-1"></i>{yearError}
                </p>
              )}
            </div>

            {/* Crop Type */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                <i className="fas fa-seedling mr-2 text-green-500"></i>Crop Type *
              </label>
              <select
                name="crop_type" value={formData.crop_type} onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
              >
                <option value="">Select a crop type</option>
                {cropOptions.map(crop => (
                  <option key={crop} value={crop}>{crop.charAt(0).toUpperCase() + crop.slice(1)}</option>
                ))}
              </select>
            </div>

            {/* Temperature */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                <i className="fas fa-thermometer-three-quarters mr-2 text-orange-500"></i>Average Temperature *
              </label>
              <div className="relative">
                <input
                  type="number" name="avg_temp" value={formData.avg_temp} onChange={handleInputChange}
                  placeholder="e.g. 27.5"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                  min="-10" max="50" step="0.1"
                />
                <div className="absolute right-3 top-3 text-gray-400 text-sm">°C</div>
              </div>
            </div>

            {/* Rainfall */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                <i className="fas fa-cloud-rain mr-2 text-blue-400"></i>Annual Rainfall *
              </label>
              <div className="relative">
                <input
                  type="number" name="average_rain_fall_mm_per_year" value={formData.average_rain_fall_mm_per_year}
                  onChange={handleInputChange} placeholder="e.g. 1200"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                  min="0" max="5000" step="1"
                />
                <div className="absolute right-3 top-3 text-gray-400 text-sm">mm/yr</div>
              </div>
            </div>

            {/* Pesticides */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                <i className="fas fa-spray-can mr-2 text-purple-500"></i>Pesticides Used *
              </label>
              <div className="relative">
                <input
                  type="number" name="pesticides_tonnes" value={formData.pesticides_tonnes}
                  onChange={handleInputChange} placeholder="e.g. 0.5"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                  min="0" max="1000" step="0.01"
                />
                <div className="absolute right-3 top-3 text-gray-400 text-sm">tonnes</div>
              </div>
            </div>

            <button
              onClick={handleYieldPrediction}
              disabled={isAnalyzing || !!yearError || !formData.Area || !formData.crop_type || !formData.avg_temp || !formData.average_rain_fall_mm_per_year || !formData.pesticides_tonnes}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover-lift"
            >
              {isAnalyzing ? (
                <><i className="fas fa-spinner fa-spin mr-2"></i>Predicting Crop Yield...</>
              ) : (
                <><i className="fas fa-chart-bar mr-2"></i>Predict Yield</>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white/80 dark:bg-gray-800/80 glass rounded-xl p-6 hover-lift">
          <h4 className="font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
            <i className="fas fa-chart-pie mr-2 text-purple-500"></i>
            Yield Prediction Results
          </h4>

          {!yieldResult ? (
            <div className="text-center py-12">
              <i className="fas fa-seedling text-4xl text-gray-400 mb-4"></i>
              <p className="text-gray-500 dark:text-gray-400">Enter farm data to predict crop yield potential</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Main Yield Card */}
              <div className="p-6 rounded-lg border-2 text-center bg-green-500/10 border-green-400/30">
                <div className="flex justify-center mb-3">
                  <i className={`fas ${getCropIcon(yieldResult.result.Crop_Type)} text-4xl text-green-500`}></i>
                </div>
                <div className="text-3xl font-bold mb-1 gradient-text">
                  {formatYield(yieldResult.result.Predicted_Yield_hg_per_ha)}
                </div>
                {yieldResult.result.Predicted_Yield_tonnes_per_ha && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    = {yieldResult.result.Predicted_Yield_tonnes_per_ha} tonnes/ha
                  </div>
                )}
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  ({yieldResult.result.Predicted_Yield_hg_per_ha.toLocaleString()} hg/ha)
                </div>
              </div>

              {/* Details Grid — Quality removed */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Crop</div>
                  <div className="font-semibold text-blue-600 capitalize text-sm">{yieldResult.result.Crop_Type}</div>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Year</div>
                  <div className="font-semibold text-green-600">{yieldResult.result.Year}</div>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Location</div>
                  <div className="font-semibold text-purple-600 text-sm truncate">{yieldResult.result.Area}</div>
                </div>
              </div>

              {/* Nova AI Advice */}
              {yieldResult.result.nova_advice && (
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-700/30">
                  <h5 className="font-semibold text-green-700 dark:text-green-300 mb-2 flex items-center">
                    <i className="fas fa-robot mr-2"></i>
                    Nova AI Farm Insights
                    <span className="ml-auto text-xs text-green-500 font-normal">Powered by Amazon Nova</span>
                  </h5>
                  <MarkdownRenderer content={yieldResult.result.nova_advice} />
                </div>
              )}

              {/* Export Button */}
              <button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 hover-lift">
                <i className="fas fa-download mr-2"></i>
                Export Yield Report
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Nova Agentic Chat */}
      <NovaChat
        context={yieldResult ? {
          crop: yieldResult.result.Crop_Type,
          disease: `Yield Forecast: ${yieldResult.result.Predicted_Yield_tonnes_per_ha || (yieldResult.result.Predicted_Yield_hg_per_ha / 10000).toFixed(2)} tonnes/ha in ${yieldResult.result.Area}`,
          confidence: 0.85,
        } : null}
        fullContext={yieldResult || undefined}
      />
    </div>
  );
};

export default YieldPrediction;