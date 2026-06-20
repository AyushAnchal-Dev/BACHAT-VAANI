'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function FlagChakra({ position }: { position: 'top-left' | 'bottom-right' }) {
  const isTopLeft = position === 'top-left';

  return (
    <div
      className={`fixed ${
        isTopLeft ? 'top-6 left-6' : 'bottom-6 right-6'
      } z-[9999] pointer-events-none hidden sm:block`}
    >
      <motion.div
        initial={{ rotateY: 0, rotateX: 20 }}
        animate={{
          rotateY: 360,
          rotateX: [20, -20, 20],
          rotateZ: [0, 360],
        }}
        transition={{
          rotateY: { duration: 12, repeat: Infinity, ease: 'linear' },
          rotateX: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
          rotateZ: { duration: 24, repeat: Infinity, ease: 'linear' },
        }}
        style={{
          transformStyle: 'preserve-3d',
          perspective: 600,
        }}
        className="w-14 h-14 md:w-20 md:h-20 drop-shadow-[0_0_15px_rgba(0,0,128,0.4)]"
      >
        {/* Outer Flag Rings (Saffron at top, Green at bottom) */}
        <div className="absolute inset-0 rounded-full border-[4px] border-t-[#FF9933] border-b-[#138808] border-l-[#FFFFFF]/40 border-r-[#FFFFFF]/40 opacity-90 shadow-[0_0_10px_rgba(255,153,51,0.2)]" />
        
        {/* Internal Navy Blue Ashoka Chakra */}
        <div className="absolute inset-[4px] rounded-full bg-white/10 backdrop-blur-[1px] flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full text-[#000080] fill-current">
            <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="3" />
            <circle cx="50" cy="50" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="50" cy="50" r="3.5" />
            {Array.from({ length: 24 }).map((_, i) => {
              const angle = (i * 360) / 24;
              return (
                <line
                  key={i}
                  x1="50"
                  y1="50"
                  x2="50"
                  y2="8"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  transform={`rotate(${angle} 50 50)`}
                />
              );
            })}
            {Array.from({ length: 24 }).map((_, i) => {
              const angle = (i * 360) / 24;
              return (
                <circle
                  key={i}
                  cx="50"
                  cy="7"
                  r="1.2"
                  transform={`rotate(${angle} 50 50)`}
                />
              );
            })}
          </svg>
        </div>
      </motion.div>
    </div>
  );
}
