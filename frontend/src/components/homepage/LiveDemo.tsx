// src/components/homepage/LiveDemo.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

type Tab = 'disease' | 'satellite' | 'irrigation';

const DEMOS: Record<Tab, {
  title: string;
  icon: string;
  label: string;
  description: string;
  result: { label: string; value: string; accent: string }[];
  advice: string;
  badge: string;
  badgeColor: string;
}> = {
  disease: {
    title: 'Crop Disease Detection',
    icon: '📷',
    label: 'Plant Level',
    description: 'A farmer uploads a photo of their apple leaves. The CNN model identifies Apple Scab at 99.8% confidence in under 5 seconds.',
    result: [
      { label: 'Crop', value: 'Apple', accent: 'text-green-400' },
      { label: 'Disease', value: 'Apple Scab', accent: 'text-red-400' },
      { label: 'Confidence', value: '99.8%', accent: 'text-amber-400' },
      { label: 'Urgency', value: 'MEDIUM', accent: 'text-yellow-400' },
    ],
    advice: 'Remove infected leaves immediately. Apply neem oil spray (2 tbsp per gallon water) every 7–10 days. Prune for better air circulation.',
    badge: 'CNN · 98.7% Accuracy',
    badgeColor: 'bg-green-900/40 text-green-400 border-green-800/40',
  },
  satellite: {
    title: 'Satellite Farm Monitoring',
    icon: '🛰️',
    label: 'Farm Level',
    description: 'A farmer draws their farm boundary. Real NASA Sentinel-2 imagery is pulled and analyzed for vegetation health and drought stress.',
    result: [
      { label: 'NDVI Mean', value: '0.099 (Poor)', accent: 'text-red-400' },
      { label: 'NDWI Mean', value: '-0.122 (Severe)', accent: 'text-orange-400' },
      { label: 'Veg. Health', value: 'POOR', accent: 'text-red-400' },
      { label: 'Drought Risk', value: 'SEVERE', accent: 'text-red-400' },
    ],
    advice: 'Urgency: HIGH. Irrigate immediately — your cassava is showing severe drought stress. Check soil moisture in the eastern zone first. Consider mulching to retain moisture.',
    badge: 'NASA HLS Sentinel-2',
    badgeColor: 'bg-blue-900/40 text-blue-400 border-blue-800/40',
  },
  irrigation: {
    title: 'Smart Irrigation',
    icon: '💧',
    label: 'Soil Level',
    description: 'Sensor data from the field is sent to the ML model. Soil moisture at 25% with temperature 32°C triggers an irrigation recommendation.',
    result: [
      { label: 'Soil Moisture', value: '25%', accent: 'text-orange-400' },
      { label: 'Temperature', value: '32°C', accent: 'text-red-400' },
      { label: 'Recommendation', value: 'IRRIGATE ON', accent: 'text-emerald-400' },
      { label: 'Confidence', value: '89.5%', accent: 'text-amber-400' },
    ],
    advice: 'Irrigate at 5–9 AM for best results. Run for 45 minutes. Target soil moisture above 35%. Apply organic mulch around plants to reduce evaporation.',
    badge: 'Random Forest Model',
    badgeColor: 'bg-cyan-900/40 text-cyan-400 border-cyan-800/40',
  },
};

const LiveDemo: React.FC = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [activeTab, setActiveTab] = useState<Tab>('disease');
  const demo = DEMOS[activeTab];

  return (
    <section id="live-demo" className="py-24 bg-[#020a04] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-emerald-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="text-emerald-500 text-sm font-semibold uppercase tracking-widest mb-4">Live Demo</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white max-w-2xl mx-auto leading-tight"
            style={{ fontFamily: "'Syne', sans-serif" }}>
            Real outputs. Real farms. Real advice.
          </h2>
        </motion.div>

        {/* Tab selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center mb-10"
        >
          <div className="inline-flex bg-white/[0.04] border border-white/10 rounded-xl p-1 gap-1">
            {(Object.keys(DEMOS) as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {DEMOS[tab].icon} {DEMOS[tab].title.split(' ')[0]} {DEMOS[tab].title.split(' ')[1]}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Demo panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left: Description */}
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="text-3xl">{demo.icon}</div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-widest">{demo.label}</div>
                    <h3 className="text-xl font-bold text-white"
                      style={{ fontFamily: "'Syne', sans-serif" }}>
                      {demo.title}
                    </h3>
                  </div>
                </div>

                <p className="text-gray-400 leading-relaxed mb-6">{demo.description}</p>

                {/* Result metrics */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {demo.result.map((r) => (
                    <div key={r.label} className="bg-black/30 rounded-xl p-3">
                      <div className="text-xs text-gray-500 mb-1">{r.label}</div>
                      <div className={`font-bold text-sm ${r.accent}`}>{r.value}</div>
                    </div>
                  ))}
                </div>

                <div className={`inline-flex items-center space-x-2 text-xs font-medium px-3 py-1.5 rounded-full border ${demo.badgeColor}`}>
                  <i className="fas fa-microchip text-xs"></i>
                  <span>{demo.badge}</span>
                </div>
              </div>

              {/* Right: Nova advice */}
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 flex flex-col">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-emerald-900/60 rounded-xl flex items-center justify-center">
                    <i className="fas fa-robot text-emerald-400 text-sm"></i>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">AgriSense AI says:</div>
                    <div className="text-xs text-gray-500">Amazon Nova · AWS Bedrock</div>
                  </div>
                  <div className="ml-auto flex space-x-1">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${(i - 1) * 150}ms` }} />
                    ))}
                  </div>
                </div>

                <div className="flex-1 bg-black/30 rounded-xl p-5">
                  <p className="text-gray-200 text-sm leading-relaxed">{demo.advice}</p>
                </div>

                <div className="mt-6 p-4 bg-emerald-950/40 border border-emerald-800/30 rounded-xl">
                  <p className="text-xs text-gray-400">
                    <i className="fas fa-comments text-emerald-500 mr-2"></i>
                    After any analysis, farmers can ask follow-up questions.
                    Nova answers with full awareness of what was just diagnosed.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default LiveDemo;