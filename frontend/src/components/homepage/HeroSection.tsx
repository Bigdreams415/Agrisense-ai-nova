// src/components/homepage/HeroSection.tsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PageProps } from '../../types';

const LAYERS = [
  { icon: '🛰️', label: 'Satellite', sub: 'Farm-level NDVI & drought risk' },
  { icon: '🚁', label: 'Drone', sub: 'Field-level live scanning' },
  { icon: '📷', label: 'Camera', sub: 'Plant-level disease detection' },
  { icon: '💧', label: 'Sensors', sub: 'Soil-level real-time data' },
];

const HeroSection: React.FC<PageProps> = ({ onEnterApp }) => {
  const [activeLayer, setActiveLayer] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveLayer(p => (p + 1) % LAYERS.length), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#050f08]">
      {/* Animated mesh background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 20% 40%, rgba(16,185,129,0.12) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 80% 60%, rgba(245,158,11,0.07) 0%, transparent 70%)',
          }}
        />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left — Copy */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center space-x-2 bg-emerald-900/40 border border-emerald-700/50 text-emerald-300 text-sm font-medium px-4 py-2 rounded-full mb-8"
            >
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              <span>Powered by Amazon Nova · AWS Bedrock</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              <span className="text-white">AI that sees</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-400">
                your farm
              </span>
              <br />
              <span className="text-white">from space</span>
              <br />
              <span className="text-white/50">to soil.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-lg text-gray-400 max-w-xl mb-10 leading-relaxed"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              AgriSense AI combines NASA satellite imagery, drone vision, CNN disease detection,
              and IoT sensors — then lets Amazon Nova turn raw data into expert farming advice
              African smallholder farmers can actually use.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 mb-16"
            >
              <button
                onClick={onEnterApp}
                className="group relative inline-flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-8 py-4 rounded-xl text-base transition-all duration-200 shadow-lg shadow-emerald-900/50"
              >
                <span>Launch AgriSense AI</span>
                <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
              </button>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 border border-white/20 hover:border-white/40 text-white/70 hover:text-white font-medium px-8 py-4 rounded-xl text-base transition-all duration-200"
              >
                <i className="fas fa-play-circle"></i>
                <span>See how it works</span>
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="grid grid-cols-3 gap-8 border-t border-white/10 pt-8"
            >
              {[
                { value: '98.7%', label: 'CNN Accuracy' },
                { value: '150+', label: 'Beta Farmers' },
                { value: '4 Layers', label: 'of AI Analysis' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-bold text-emerald-400" style={{ fontFamily: "'Syne', sans-serif" }}>{s.value}</div>
                  <div className="text-sm text-gray-500 mt-1">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — Precision Stack Visual */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            className="relative"
          >
            <div className="relative bg-white/[0.03] border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
              {/* Title */}
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-6">
                Precision Agriculture Stack
              </div>

              {/* Layers */}
              <div className="space-y-3">
                {LAYERS.map((layer, i) => (
                  <motion.div
                    key={layer.label}
                    animate={{
                      backgroundColor: activeLayer === i
                        ? 'rgba(16,185,129,0.12)'
                        : 'rgba(255,255,255,0.02)',
                      borderColor: activeLayer === i
                        ? 'rgba(16,185,129,0.4)'
                        : 'rgba(255,255,255,0.06)',
                    }}
                    transition={{ duration: 0.4 }}
                    className="flex items-center space-x-4 p-4 rounded-xl border"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                      activeLayer === i ? 'bg-emerald-900/60' : 'bg-white/5'
                    }`}>
                      {layer.icon}
                    </div>
                    <div className="flex-1">
                      <div className={`font-semibold text-sm ${activeLayer === i ? 'text-emerald-300' : 'text-white/60'}`}>
                        {layer.label}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">{layer.sub}</div>
                    </div>
                    {activeLayer === i && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse flex-shrink-0"
                      />
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Nova output preview */}
              <div className="mt-6 p-4 bg-black/40 rounded-xl border border-white/5">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-6 h-6 bg-emerald-800 rounded-full flex items-center justify-center">
                    <i className="fas fa-robot text-emerald-400 text-xs"></i>
                  </div>
                  <span className="text-xs text-emerald-400 font-medium">AgriSense AI</span>
                  <span className="text-xs text-gray-600 ml-auto">via Amazon Nova</span>
                </div>
                <motion.p
                  key={activeLayer}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-xs text-gray-300 leading-relaxed"
                >
                  {activeLayer === 0 && "🛰️ NDVI mean 0.099 — vegetation health is POOR. Drought risk: SEVERE. Recommend immediate irrigation and drone inspection of eastern section."}
                  {activeLayer === 1 && "🚁 Drone frame analysis: Tomato Late Blight detected at 94.2% confidence. 3 affected zones identified. Spray copper fungicide within 24 hours."}
                  {activeLayer === 2 && "📷 Apple Scab detected (99.8% confidence). Urgency: MEDIUM. Apply neem oil spray every 7–10 days. Remove infected leaves immediately."}
                  {activeLayer === 3 && "💧 Soil moisture at 25% — irrigation ON recommended (89.5% confidence). Best time: 5–9 AM. Run for 45 minutes. Check again in 6 hours."}
                </motion.p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center space-y-2 text-gray-600">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-5 h-8 border border-gray-700 rounded-full flex justify-center pt-1.5">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-2 bg-gray-500 rounded-full"
            />
          </div>
        </div>
      </motion.div>

      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet" />
    </section>
  );
};

export default HeroSection;