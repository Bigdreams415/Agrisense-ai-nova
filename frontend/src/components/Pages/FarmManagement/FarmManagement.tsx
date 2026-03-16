import React from "react";

interface FarmManagementProps {
  onNavigate?: (route: string) => void;
}

const FarmManagement: React.FC<FarmManagementProps> = ({ onNavigate }) => {
  const tools = [
    {
      icon: "fa-bug",
      iconBg: "bg-red-100 dark:bg-red-900/30",
      iconColor: "text-red-600",
      title: "Pest & Disease Detection",
      description: "Upload a crop image and our CNN model (98.7% accuracy) instantly identifies diseases. Amazon Nova then generates a full treatment plan.",
      badge: "AI Powered",
      badgeColor: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
      route: "workspace",
      btnColor: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700",
      features: ["Image upload & live camera", "Drone stream analysis", "Nova AI treatment advice"],
    },
    {
      icon: "fa-tint",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600",
      title: "Smart Irrigation",
      description: "Enter your soil moisture, temperature and humidity readings. Our AI model tells you exactly when and how long to irrigate.",
      badge: "Sensor Based",
      badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      route: "workspace",
      btnColor: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
      features: ["Soil moisture analysis", "Weather-aware decisions", "Nova AI water tips"],
    },
    {
      icon: "fa-chart-line",
      iconBg: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600",
      title: "Yield Prediction",
      description: "Forecast your harvest before the season ends. Enter farm data and get an AI-driven yield estimate with actionable insights from Nova.",
      badge: "Forecast",
      badgeColor: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
      route: "workspace",
      btnColor: "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
      features: ["Multi-crop support", "Climate risk analysis", "Harvest & storage advice"],
    },
  ];

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold gradient-text mb-1">My Farm</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Quick access to all AI-powered tools for your farm
        </p>
      </div>

      {/* Tool Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {tools.map((tool) => (
          <div
            key={tool.title}
            className="bg-white/80 dark:bg-gray-800/80 glass rounded-xl p-6 hover-lift flex flex-col"
          >
            {/* Icon + Badge */}
            <div className="flex items-start justify-between mb-4">
              <div className={`w-14 h-14 ${tool.iconBg} rounded-xl flex items-center justify-center`}>
                <i className={`fas ${tool.icon} ${tool.iconColor} text-2xl`}></i>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tool.badgeColor}`}>
                {tool.badge}
              </span>
            </div>

            {/* Title + Description */}
            <h4 className="font-bold text-lg text-gray-800 dark:text-white mb-2">{tool.title}</h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 flex-1">{tool.description}</p>

            {/* Features */}
            <ul className="space-y-1.5 mb-5">
              {tool.features.map((f) => (
                <li key={f} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <i className="fas fa-check text-green-500 text-xs flex-shrink-0"></i>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <button
              onClick={() => onNavigate?.(tool.route)}
              className={`w-full ${tool.btnColor} text-white py-2.5 rounded-lg font-semibold transition-all duration-200 text-sm`}
            >
              <i className="fas fa-arrow-right mr-2"></i>
              Open Tool
            </button>
          </div>
        ))}
      </div>

      {/* Nova Farm Assistant Banner */}
      <div
        className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white cursor-pointer hover:from-green-600 hover:to-emerald-700 transition-all duration-200 hover-lift"
        onClick={() => onNavigate?.('farm-assistant')}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <i className="fas fa-robot text-white text-xl"></i>
            </div>
            <div>
              <h4 className="font-bold text-lg">Nova Farm Assistant</h4>
              <p className="text-green-100 text-sm">
                Ask any farming question — soil, crops, weather, pests, harvest timing. Powered by Amazon Nova.
              </p>
            </div>
          </div>
          <i className="fas fa-arrow-right text-white/70 text-xl hidden md:block"></i>
        </div>
      </div>
    </div>
  );
};

export default FarmManagement;