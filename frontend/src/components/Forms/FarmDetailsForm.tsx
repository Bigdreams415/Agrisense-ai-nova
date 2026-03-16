import React, { useState } from 'react';

// Updated props interface
const FarmDetailsForm: React.FC<{
  farmName: string;
  onFarmNameChange: (name: string) => void;
  plantingDate: string;
  onPlantingDateChange: (date: string) => void;
  onCoordinatesChange: (coords: number[][]) => void;  
}> = ({ farmName, onFarmNameChange, plantingDate, onPlantingDateChange, onCoordinatesChange }) => {
  const [swLongitude, setSwLongitude] = useState('');
  const [swLatitude, setSwLatitude] = useState('');
  const [neLongitude, setNeLongitude] = useState('');
  const [neLatitude, setNeLatitude] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [coordError, setCoordError] = useState<string | null>(null);   

  const handleCoordinateChange = () => {
    if (!swLongitude || !swLatitude || !neLongitude || !neLatitude) {
      setCoordError('Please fill all coordinate fields');
      return;
    }

    const swLon = parseFloat(swLongitude);
    const swLat = parseFloat(swLatitude);
    const neLon = parseFloat(neLongitude);
    const neLat = parseFloat(neLatitude);

    if (isNaN(swLon) || isNaN(swLat) || isNaN(neLon) || isNaN(neLat)) {
      setCoordError('Please enter valid numbers for coordinates (no letters or symbols)');
      return;
    }
    if (swLon >= neLon || swLat >= neLat) {
      setCoordError('Southwest must be bottom-left, Northeast top-right (lon1 < lon2, lat1 < lat2)');
      return;
    }

    const boundingBox: number[][] = [
      [swLon, swLat],  
      [neLon, neLat]   // Northeast
    ];
    onCoordinatesChange(boundingBox);
    setCoordError(null);  
  };

  React.useEffect(() => {
    if (swLongitude && swLatitude && neLongitude && neLatitude) {
      const timer = setTimeout(handleCoordinateChange, 500);   
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swLongitude, swLatitude, neLongitude, neLatitude]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          Farm Name (Optional)
        </label>
        <input
          type="text"
          value={farmName}
          onChange={(e) => onFarmNameChange(e.target.value)}
          placeholder="e.g., Family Maize Field"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          Planting Date
        </label>
        <input
          type="date"
          value={plantingDate}
          onChange={(e) => onPlantingDateChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          This helps us track crop growth stages
        </p>
      </div>

      {/* Manual GPS Coordinates Input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            GPS Coordinates (Optional)
          </label>
          <button
            type="button"
            onClick={() => setShowManualInput(!showManualInput)}
            className="text-xs text-blue-500 hover:text-blue-700"
          >
            {showManualInput ? 'Hide' : 'Add manually'}
          </button>
        </div>

        {showManualInput && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">
                  Southwest Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={swLongitude}
                  onChange={(e) => setSwLongitude(e.target.value)}
                  placeholder="e.g., 3.914"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">
                  Southwest Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={swLatitude}
                  onChange={(e) => setSwLatitude(e.target.value)}
                  placeholder="e.g., 7.424"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">
                  Northeast Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={neLongitude}
                  onChange={(e) => setNeLongitude(e.target.value)}
                  placeholder="e.g., 3.926"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">
                  Northeast Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={neLatitude}
                  onChange={(e) => setNeLatitude(e.target.value)}
                  placeholder="e.g., 7.436"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Enter coordinates in decimal degrees format
            </p>
            
            {/* Coord Error Display */}
            {coordError && (
              <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-600 dark:text-red-400">
                {coordError}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-start space-x-2">
          <i className="fas fa-info-circle text-blue-500 mt-0.5"></i>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Tip:</strong> You can draw on the map OR enter coordinates manually. 
            Both methods will help us monitor your farm via satellite.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FarmDetailsForm;