// src/components/homepage/ProblemSection.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const problems = [
  {
    icon: '🐛',
    title: 'Crop Losses Go Undetected',
    description: 'By the time a farmer notices a pest or disease with the naked eye, it has already spread. Traditional inspection is too slow and too inaccurate.',
    stat: '40%',
    statText: 'of crops lost annually to pests & disease',
    color: 'red',
  },
  {
    icon: '🌡️',
    title: 'Climate Risk Is Invisible',
    description: 'Drought stress, soil moisture levels, and vegetation decline happen gradually and invisibly. Farmers have no early warning system.',
    stat: '70%',
    statText: 'of African smallholder farms affected by drought',
    color: 'orange',
  },
  {
    icon: '🧑‍🌾',
    title: 'Expert Advice Is Inaccessible',
    description: 'Agronomists cost money most small farms don\'t have. Advice online is generic. Farmers make critical decisions without expert guidance.',
    stat: '500M',
    statText: 'small farms with no access to agricultural experts',
    color: 'amber',
  },
  {
    icon: '📡',
    title: 'Drone Data Sits Unused',
    description: 'Some farms have drones but no AI to make sense of the footage. Hours of video are captured and never analyzed systematically.',
    stat: '80%',
    statText: 'of captured farm data goes unanalyzed',
    color: 'yellow',
  },
];

const ProblemSection: React.FC = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="problem" className="py-24 bg-[#050f08] relative overflow-hidden">
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
          className="mb-16"
        >
          <p className="text-emerald-500 text-sm font-semibold uppercase tracking-widest mb-4">The Challenge</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight max-w-2xl"
            style={{ fontFamily: "'Syne', sans-serif" }}>
            Smallholder farmers fight battles they can't even see.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {problems.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="group relative bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 rounded-2xl p-8 transition-all duration-300"
            >
              <div className="flex items-start space-x-5">
                <div className="text-3xl flex-shrink-0 mt-1">{p.icon}</div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2"
                    style={{ fontFamily: "'Syne', sans-serif" }}>
                    {p.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-5">{p.description}</p>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl font-bold text-red-400"
                      style={{ fontFamily: "'Syne', sans-serif" }}>
                      {p.stat}
                    </span>
                    <span className="text-xs text-gray-500">{p.statText}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 p-8 bg-gradient-to-r from-red-950/40 to-orange-950/30 border border-red-900/40 rounded-2xl text-center"
        >
          <p className="text-white font-semibold text-lg mb-2">
            The technology to solve all of this exists.
          </p>
          <p className="text-gray-400 text-sm">
            NASA satellites, computer vision, large language models — none of it has been built
            specifically for the smallholder farmer in Africa. Until now.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ProblemSection;