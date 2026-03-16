import React, { useState, useEffect } from 'react';

const STEPS = [
  {
    icon: 'fa-satellite',
    label: 'Connecting to NASA Earthdata',
    detail: 'Authenticating with NASA Earthdata servers...',
    color: 'text-blue-500',
    bg: 'bg-blue-500',
    duration: 4000,
  },
  {
    icon: 'fa-search',
    label: 'Searching for satellite granules',
    detail: 'Querying HLS Sentinel-2 imagery for your farm boundaries...',
    color: 'text-indigo-500',
    bg: 'bg-indigo-500',
    duration: 6000,
  },
  {
    icon: 'fa-cloud-download-alt',
    label: 'Downloading imagery bands',
    detail: 'Fetching B03, B04, B08 spectral bands + cloud mask...',
    color: 'text-purple-500',
    bg: 'bg-purple-500',
    duration: 25000,
  },
  {
    icon: 'fa-calculator',
    label: 'Computing NDVI & NDWI indices',
    detail: 'Calculating vegetation health and drought risk from spectral data...',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500',
    duration: 8000,
  },
  {
    icon: 'fa-robot',
    label: 'Generating AgriSense AI insights',
    detail: 'Amazon Nova analyzing satellite data for your farm...',
    color: 'text-green-500',
    bg: 'bg-green-500',
    duration: 99999, // stays here until done
  },
];

const SatelliteProgress: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);

  useEffect(() => {
    setCurrentStep(0);
    setStepProgress(0);
  }, []);

  // Auto-advance through steps
  useEffect(() => {
    if (currentStep >= STEPS.length - 1) return;

    const step = STEPS[currentStep];
    const tickInterval = 50;
    const totalTicks = step.duration / tickInterval;
    let ticks = 0;

    const timer = setInterval(() => {
      ticks++;
      const progress = Math.min((ticks / totalTicks) * 100, 100);
      setStepProgress(progress);

      if (ticks >= totalTicks) {
        clearInterval(timer);
        setCurrentStep((prev) => prev + 1);
        setStepProgress(0);
      }
    }, tickInterval);

    return () => clearInterval(timer);
  }, [currentStep]);

  // Pulse the last step
  //eslint-disable-next-line
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    if (currentStep === STEPS.length - 1) {
      const t = setInterval(() => setPulse((p) => !p), 700);
      return () => clearInterval(t);
    }
  }, [currentStep]);

  const overallProgress = ((currentStep / STEPS.length) * 100) + (stepProgress / STEPS.length);

  return (
    <div className="py-6 px-2">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
          <i className="fas fa-satellite text-white text-sm animate-pulse"></i>
        </div>
        <div>
          <h5 className="font-bold text-gray-800 dark:text-white">Satellite Analysis Running</h5>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Pulling live data from NASA Earthdata · This takes ~50 seconds
          </p>
        </div>
      </div>

      {/* Overall progress bar */}
      <div className="mb-5">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
          <span>Overall Progress</span>
          <span>{Math.round(overallProgress)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-green-500 transition-all duration-300"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {STEPS.map((step, index) => {
          const isDone = index < currentStep;
          const isActive = index === currentStep;
          //eslint-disable-next-line
          const isPending = index > currentStep;

          return (
            <div
              key={index}
              className={`flex items-start space-x-3 p-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/40'
                  : isDone
                  ? 'opacity-60'
                  : 'opacity-30'
              }`}
            >
              {/* Icon */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isDone ? 'bg-green-100 dark:bg-green-900/30' :
                isActive ? 'bg-blue-100 dark:bg-blue-900/30' :
                'bg-gray-100 dark:bg-gray-700/30'
              }`}>
                {isDone ? (
                  <i className="fas fa-check text-green-600 text-xs"></i>
                ) : (
                  <i className={`fas ${step.icon} ${
                    isActive ? step.color : 'text-gray-400'
                  } text-xs ${isActive ? 'animate-pulse' : ''}`}></i>
                )}
              </div>

              {/* Label + detail */}
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium ${
                  isDone ? 'text-green-700 dark:text-green-400' :
                  isActive ? 'text-gray-800 dark:text-white' :
                  'text-gray-400 dark:text-gray-500'
                }`}>
                  {step.label}
                  {isDone && <span className="ml-2 text-green-500 text-xs">✓ Done</span>}
                </div>
                {isActive && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{step.detail}</p>
                )}

                {/* Step progress bar (active only) */}
                {isActive && index < STEPS.length - 1 && (
                  <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${step.bg} transition-all duration-100`}
                      style={{ width: `${stepProgress}%` }}
                    />
                  </div>
                )}

                {/* Last step pulsing dots */}
                {isActive && index === STEPS.length - 1 && (
                  <div className="flex space-x-1 mt-2">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-green-500 animate-bounce"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Fun fact */}
      <div className="mt-5 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          <i className="fas fa-info-circle mr-1"></i>
          Sentinel-2 captures Earth at 10m resolution every 5 days.
          Your farm is being analyzed with real NASA HLS data.
        </p>
      </div>
    </div>
  );
};

export default SatelliteProgress;