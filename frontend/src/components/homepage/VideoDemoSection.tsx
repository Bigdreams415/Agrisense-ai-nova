// src/components/homepage/VideoDemoSection.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { PageProps } from '../../types';

interface Props {
  onEnterApp?: PageProps['onEnterApp'];
}

const VideoDemoSection: React.FC<Props> = ({ onEnterApp }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="video-demo" className="py-24 bg-[#050f08] relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="max-w-5xl mx-auto px-6 lg:px-8 relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <p className="text-emerald-500 text-sm font-semibold uppercase tracking-widest mb-4">Demo Video</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white max-w-2xl mx-auto leading-tight"
            style={{ fontFamily: "'Syne', sans-serif" }}>
            See AgriSense AI in 3 minutes.
          </h2>
          <p className="text-gray-400 mt-4 max-w-xl mx-auto">
            Watch a farmer go from uploading a cassava leaf photo to getting a full treatment plan,
            checking satellite drought risk, and asking follow-up questions — all in one session.
          </p>
        </motion.div>

        {/* Video Player */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50 bg-black aspect-video"
        >
          <iframe
            src="https://www.youtube.com/embed/Lq_KbfINthI?rel=0&modestbranding=1"
            title="AgriSense AI Demo"
            allowFullScreen
            className="w-full h-full"
          />
          <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs px-3 py-1.5 rounded-lg backdrop-blur-sm flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span>3-Minute Demo · AgriSense AI</span>
          </div>
        </motion.div>

        {/* CTA below video */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={onEnterApp}
            className="group inline-flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-8 py-4 rounded-xl text-base transition-all duration-200 shadow-lg shadow-emerald-900/40"
          >
            <span>Try it yourself</span>
            <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
          </button>
          <p className="text-gray-500 text-sm">No login required · Runs in your browser</p>
        </motion.div>
      </div>
    </section>
  );
};

export default VideoDemoSection;