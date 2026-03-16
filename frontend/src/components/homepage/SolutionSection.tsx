// src/components/homepage/SolutionSection.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const solutions = [
  {
    layer: '01',
    icon: '🛰️',
    title: 'Satellite Intelligence',
    sub: 'Farm-level monitoring',
    description: 'Draw your farm boundary on the map. AgriSense AI pulls real NASA Sentinel-2 imagery and computes NDVI and NDWI indices to assess vegetation health and drought risk across your entire field.',
    features: ['Real NASA HLS Sentinel-2 data', 'NDVI vegetation health scoring', 'Drought risk assessment', 'Amazon Nova farm insights'],
    accent: 'from-blue-500 to-indigo-600',
    accentBg: 'bg-blue-900/20',
    accentText: 'text-blue-400',
    accentBorder: 'border-blue-800/40',
  },
  {
    layer: '02',
    icon: '🚁',
    title: 'Drone Vision',
    sub: 'Field-level scanning',
    description: 'Connect any RTSP or RTMP drone stream. AgriSense AI analyzes each frame in real-time, detecting diseases and pests across entire fields automatically — no manual review needed.',
    features: ['RTSP & RTMP live stream support', 'Frame-by-frame CNN analysis', 'WebSocket real-time results', 'Drone footage upload support'],
    accent: 'from-purple-500 to-pink-600',
    accentBg: 'bg-purple-900/20',
    accentText: 'text-purple-400',
    accentBorder: 'border-purple-800/40',
  },
  {
    layer: '03',
    icon: '📷',
    title: 'Disease Detection',
    sub: 'Plant-level diagnosis',
    description: 'Upload a photo or use your live camera. Our CNN model — trained on 50,000 PlantVillage images with 98.7% accuracy — identifies the exact disease and Amazon Nova generates a personalized treatment plan.',
    features: ['98.7% CNN accuracy', '38 crop diseases detected', 'Urgency level assessment', 'Organic-first treatment advice'],
    accent: 'from-emerald-500 to-teal-600',
    accentBg: 'bg-emerald-900/20',
    accentText: 'text-emerald-400',
    accentBorder: 'border-emerald-800/40',
  },
  {
    layer: '04',
    icon: '💧',
    title: 'Smart Irrigation & Yield',
    sub: 'Soil-level intelligence',
    description: 'Connect IoT sensors for real-time soil monitoring, or enter readings manually. Our ML models predict whether to irrigate and forecast crop yield — then Nova explains the reasoning in plain language.',
    features: ['IoT sensor integration via MQTT', 'Irrigation ON/OFF prediction', 'Crop yield forecasting', 'Multi-turn agentic chat'],
    accent: 'from-cyan-500 to-blue-600',
    accentBg: 'bg-cyan-900/20',
    accentText: 'text-cyan-400',
    accentBorder: 'border-cyan-800/40',
  },
];

const SolutionSection: React.FC = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.05 });

  return (
    <section id="solution" className="py-24 bg-[#020a04] relative overflow-hidden">
      {/* Subtle green glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-900/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <p className="text-emerald-500 text-sm font-semibold uppercase tracking-widest mb-4">The Solution</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white max-w-3xl mx-auto leading-tight"
            style={{ fontFamily: "'Syne', sans-serif" }}>
            Four layers of AI. One complete picture of your farm.
          </h2>
          <p className="text-gray-400 mt-6 max-w-2xl mx-auto text-lg">
            No other platform gives African smallholder farmers this complete a view —
            from 500km above the Earth to the moisture in their soil.
          </p>
        </motion.div>

        <div className="space-y-6">
          {solutions.map((s, i) => (
            <motion.div
              key={s.layer}
              initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.15 }}
              className={`group relative bg-white/[0.02] hover:bg-white/[0.05] border ${s.accentBorder} rounded-2xl p-8 transition-all duration-300 overflow-hidden`}
            >
              {/* Layer number watermark */}
              <div className="absolute right-8 top-8 text-7xl font-bold text-white/[0.03] select-none"
                style={{ fontFamily: "'Syne', sans-serif" }}>
                {s.layer}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
                <div>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`w-12 h-12 ${s.accentBg} rounded-xl flex items-center justify-center text-2xl`}>
                      {s.icon}
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-widest">{s.sub}</div>
                      <h3 className="text-xl font-bold text-white"
                        style={{ fontFamily: "'Syne', sans-serif" }}>
                        {s.title}
                      </h3>
                    </div>
                  </div>
                  <p className="text-gray-400 leading-relaxed">{s.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {s.features.map((f) => (
                    <div key={f} className="flex items-center space-x-2 text-sm">
                      <i className={`fas fa-check-circle ${s.accentText} text-xs flex-shrink-0`}></i>
                      <span className="text-gray-300">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Nova tie-in */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="mt-12 p-8 bg-gradient-to-r from-emerald-950/60 to-teal-950/40 border border-emerald-800/40 rounded-2xl"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-emerald-900/60 rounded-xl flex items-center justify-center">
                <i className="fas fa-robot text-emerald-400 text-lg"></i>
              </div>
              <div>
                <div className="font-bold text-white"
                  style={{ fontFamily: "'Syne', sans-serif" }}>
                  Amazon Nova runs through every layer
                </div>
                <p className="text-gray-400 text-sm mt-1">
                  Every analysis — satellite, drone, camera, or sensor — feeds into Amazon Nova
                  via AWS Bedrock. The farmer gets plain-language advice, not raw numbers.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500 flex-shrink-0">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Amazon_Web_Services_Logo.svg/120px-Amazon_Web_Services_Logo.svg.png"
                alt="AWS" className="h-5 opacity-40" />
              <span>Bedrock · Nova Lite</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SolutionSection;