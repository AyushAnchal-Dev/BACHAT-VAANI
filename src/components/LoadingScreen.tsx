'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function LoadingScreen() {
  const text = "BachatVaani";

  // Animation variants
  const letterVariants = {
    initial: { opacity: 0, y: 10 },
    animate: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.6 + i * 0.05,
        duration: 0.4,
        ease: [0.215, 0.61, 0.355, 1], // easeOutCubic
      },
    }),
  };

  const waveVariants = {
    animate: (i: number) => ({
      scaleY: [0.3, 1.1, 0.3],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        delay: i * 0.15,
        ease: 'easeInOut',
      },
    }),
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#090d16] text-[#f8fafc]">
      <div className="flex flex-col items-center space-y-8">
        
        {/* Logo Draw Animation + Voice Wave */}
        <div className="relative flex items-center justify-center w-24 h-24">
          
          {/* Voice Wave on Left */}
          <div className="absolute left-[-20px] flex items-center gap-1 h-8">
            {[1, 2, 3].map((val, idx) => (
              <motion.span
                key={`left-wave-${idx}`}
                custom={idx}
                variants={waveVariants}
                animate="animate"
                className="w-1 bg-accent rounded-full origin-center"
                style={{ height: `${12 + idx * 8}px` }}
              />
            ))}
          </div>

          {/* Center Logo Draw */}
          <svg className="w-16 h-16 text-blue-500" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Bank/Shield outline */}
            <motion.path
              d="M50 15 L80 30 V60 C80 75, 50 85, 50 85 C50 85, 20 75, 20 60 V30 L50 15 Z"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.0, ease: "easeInOut" }}
            />
            {/* Microphone inside */}
            <motion.path
              d="M50 32 C46 32, 43 35, 43 39 V51 C43 55, 46 58, 50 58 C54 58, 57 55, 57 51 V39 C57 35, 54 32, 50 32 Z"
              stroke="#00d09c"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeInOut" }}
            />
            {/* Mic stand */}
            <motion.path
              d="M38 51 C38 59, 62 59, 62 51 M50 59 V70 M40 70 H60"
              stroke="#00d09c"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 0.6, ease: "easeInOut" }}
            />
          </svg>

          {/* Voice Wave on Right */}
          <div className="absolute right-[-20px] flex items-center gap-1 h-8">
            {[3, 2, 1].map((val, idx) => (
              <motion.span
                key={`right-wave-${idx}`}
                custom={idx}
                variants={waveVariants}
                animate="animate"
                className="w-1 bg-accent rounded-full origin-center"
                style={{ height: `${12 + (3 - idx) * 8}px` }}
              />
            ))}
          </div>

        </div>

        {/* Text Reveal "BachatVaani" */}
        <div className="space-y-2 text-center">
          <div className="flex justify-center items-center">
            {text.split('').map((char, index) => (
              <motion.span
                key={index}
                custom={index}
                variants={letterVariants}
                initial="initial"
                animate="animate"
                style={{
                  color: index < 6 ? '#2563eb' : '#00d09c',
                }}
                className="text-3xl md:text-4.5xl font-extrabold tracking-wider"
              >
                {char}
              </motion.span>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold"
          >
            Loading your safety net...
          </motion.p>
        </div>

      </div>
    </div>
  );
}
