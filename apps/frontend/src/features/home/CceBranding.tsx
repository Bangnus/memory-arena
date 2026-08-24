'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export function CceBranding() {
  const [animKey, setAnimKey] = useState(0);

  // Loop typewriter animation every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimKey((prev) => prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      key={animKey}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.03 }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.03,
            delayChildren: 0.1,
          },
        },
      }}
      className="inline-flex items-center gap-4 text-white cursor-default select-none"
    >
      <motion.div
        variants={{
          hidden: { scale: 0, rotate: -15, opacity: 0 },
          visible: {
            scale: 1,
            rotate: 0,
            opacity: 1,
            transition: { duration: 0.45, ease: 'backOut' },
          },
        }}
        className="flex-shrink-0"
      >
        <Image
          src="/logo-cce.png"
          alt="CCE Logo"
          width={96}
          height={96}
          className="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 object-contain flex-shrink-0"
        />
      </motion.div>

      <div className="text-sm sm:text-base md:text-lg font-bold font-orbitron tracking-wider text-white leading-tight flex flex-wrap gap-x-2">
        {'COMPUTER & COMMUNICATION ENGINEERING'.split(' ').map((word, wordIdx) => (
          <span key={wordIdx} className="inline-flex whitespace-nowrap">
            {word.split('').map((char, charIdx) => (
              <motion.span
                key={charIdx}
                variants={{
                  hidden: { opacity: 0, y: 8, filter: 'blur(3px)' },
                  visible: {
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                    transition: { duration: 0.25, ease: 'easeOut' },
                  },
                }}
                className="inline-block"
              >
                {char}
              </motion.span>
            ))}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
