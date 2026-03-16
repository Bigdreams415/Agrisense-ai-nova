// src/components/homepage/HowItWorks.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const steps = [
  {
    number: '01',
    icon: 'fa-upload',
    title: 'Capture or Connect',
    description: 'Upload a crop photo, draw your farm boundary on the map, connect your drone stream, or pair your IoT soil sensors. AgriSense AI accepts data from any source.',
    detail: 'Camera · Drone · Satellite · Sensors',
    color: 'emerald',
  },
  {
    number: '02',
    icon: 'fa-brain',
    title: 'AI Analyzes Everything',
    description: 'Our CNN model detects diseases at 98.7% accuracy. NASA satellite data computes NDVI and drought risk. ML models predict irrigation needs and harvest yield.',
    detail: 'CNN · NASA HLS · Random Forest',
    color: 'blue',
  },
  {
    number: '03',
    icon: 'fa-robot',
    title: 'Nova Advises Your Farm',
    description: 'Amazon Nova takes the raw predictions and generates practical, affordable advice in plain language. Then you can ask follow-up questions — Nova remembers the full context.',
    detail: 'Amazon Nova Lite · AWS Bedrock',
    color: 'amber',
  },
];

const HowItWorks: React.FC = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="how-it-works" className="py-24 bg-[#050f08] relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <p className="text-emerald-500 text-sm font-semibold uppercase tracking-widest mb-4">How It Works</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white max-w-2xl mx-auto leading-tight"
            style={{ fontFamily: "'Syne', sans-serif" }}>
            From image to expert advice in seconds.
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line */}
          <div className="absolute top-16 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent hidden lg:block" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 50 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: i * 0.2 }}
                className="relative"
              >
                {/* Step number + icon */}
                <div className="relative flex items-center justify-center mb-8">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                    step.color === 'emerald' ? 'bg-emerald-900/60 border border-emerald-700/50' :
                    step.color === 'blue' ? 'bg-blue-900/60 border border-blue-700/50' :
                    'bg-amber-900/60 border border-amber-700/50'
                  }`}>
                    <i className={`fas ${step.icon} text-xl ${
                      step.color === 'emerald' ? 'text-emerald-400' :
                      step.color === 'blue' ? 'text-blue-400' :
                      'text-amber-400'
                    }`}></i>
                  </div>
                  <span className="absolute -top-2 -right-2 text-xs font-bold text-gray-600 bg-[#050f08] px-1"
                    style={{ fontFamily: "'Syne', sans-serif" }}>
                    {step.number}
                  </span>
                </div>

                {/* Content */}
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors duration-300">
                  <h3 className="text-xl font-bold text-white mb-3"
                    style={{ fontFamily: "'Syne', sans-serif" }}>
                    {step.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">
                    {step.description}
                  </p>
                  <div className={`inline-flex items-center space-x-2 text-xs font-medium px-3 py-1.5 rounded-full ${
                    step.color === 'emerald' ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800/40' :
                    step.color === 'blue' ? 'bg-blue-900/40 text-blue-400 border border-blue-800/40' :
                    'bg-amber-900/40 text-amber-400 border border-amber-800/40'
                  }`}>
                    <i className="fas fa-microchip text-xs"></i>
                    <span>{step.detail}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Agentic chat callout */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Chat preview */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500 uppercase tracking-widest">Agentic Chat</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-end">
                <div className="bg-emerald-900/40 text-emerald-100 text-sm px-4 py-2 rounded-xl rounded-tr-sm max-w-[80%]">
                  Is this disease spreading to my tomatoes too?
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-6 h-6 bg-emerald-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <i className="fas fa-robot text-emerald-400 text-xs"></i>
                </div>
                <div className="bg-white/5 text-gray-300 text-sm px-4 py-2 rounded-xl rounded-tl-sm max-w-[80%]">
                  Apple Scab is specific to apple trees and won't spread to tomatoes. However, the wet conditions that favour it could encourage early blight on your tomatoes — inspect lower leaves now.
                </div>
              </div>
            </div>
          </div>

          {/* Nova context awareness */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 flex flex-col justify-center">
            <i className="fas fa-memory text-2xl text-amber-400 mb-4"></i>
            <h4 className="font-bold text-white mb-2"
              style={{ fontFamily: "'Syne', sans-serif" }}>
              Nova remembers your diagnosis
            </h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              Every follow-up question you ask is answered in full awareness of what was just analyzed.
              No need to repeat yourself — AgriSense AI keeps the full context and gives advice that actually
              applies to your specific farm situation.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;