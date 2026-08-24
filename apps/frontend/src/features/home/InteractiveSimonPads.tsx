'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Gamepad2 } from 'lucide-react';
import { useSound } from '@/hooks/useSound';

const COLOR_PADS = [
  {
    id: 'RED',
    label: 'RED',
    bg: 'bg-rose-500',
    border: 'border-rose-300',
    glow: 'shadow-[0_0_15px_rgba(244,63,94,0.5)]',
    activeGlow: 'shadow-[0_0_35px_rgba(244,63,94,1)] scale-95 brightness-125 border-white',
  },
  {
    id: 'GREEN',
    label: 'GREEN',
    bg: 'bg-emerald-500',
    border: 'border-emerald-300',
    glow: 'shadow-[0_0_15px_rgba(16,185,129,0.5)]',
    activeGlow: 'shadow-[0_0_35px_rgba(16,185,129,1)] scale-95 brightness-125 border-white',
  },
  {
    id: 'BLUE',
    label: 'BLUE',
    bg: 'bg-blue-500',
    border: 'border-blue-300',
    glow: 'shadow-[0_0_15px_rgba(59,130,246,0.5)]',
    activeGlow: 'shadow-[0_0_35px_rgba(59,130,246,1)] scale-95 brightness-125 border-white',
  },
  {
    id: 'YELLOW',
    label: 'YELLOW',
    bg: 'bg-amber-400',
    border: 'border-amber-200',
    glow: 'shadow-[0_0_15px_rgba(251,191,36,0.5)]',
    activeGlow: 'shadow-[0_0_35px_rgba(251,191,36,1)] scale-95 brightness-125 border-white',
  },
];

export function InteractiveSimonPads() {
  const [activePad, setActivePad] = useState<string | null>(null);
  const { playButtonPress } = useSound();

  const handlePadClick = (id: string) => {
    setActivePad(id);
    playButtonPress();
    setTimeout(() => {
      setActivePad(null);
    }, 250);
  };

  return (
    <div className="space-y-2 select-none">
      {/* Header Label */}
      <div className="flex items-center justify-center lg:justify-start gap-2 text-xs font-orbitron font-bold text-white/90 uppercase tracking-wider">
        <Gamepad2 className="w-4 h-4 text-cyan-300" />
        <span>Hardware Color Console</span>
        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
      </div>

      {/* Translucent White Glassmorphism Console Box */}
      <div className="p-3 sm:p-4 rounded-3xl bg-white/15 hover:bg-white/20 backdrop-blur-xl border border-white/40 shadow-xl w-fit mx-auto lg:mx-0 transition-all duration-300">
        {/* 4 Interactive Buttons */}
        <div className="flex items-center justify-center gap-3 sm:gap-4">
          {COLOR_PADS.map((pad) => {
            const isActive = activePad === pad.id;

            return (
              <motion.button
                key={pad.id}
                onClick={() => handlePadClick(pad.id)}
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.92 }}
                className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 ${pad.border} ${pad.bg} transition-all duration-200 flex items-center justify-center cursor-pointer overflow-hidden ${
                  isActive ? pad.activeGlow : `${pad.glow} hover:brightness-110`
                }`}
              >
                {/* Ripple Shockwave Ring on Click */}
                {isActive && (
                  <motion.span
                    initial={{ scale: 0.5, opacity: 0.9 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="absolute inset-0 rounded-full bg-white/70 pointer-events-none"
                  />
                )}

                {/* Label Letter */}
                <span className="relative z-10 font-orbitron font-black text-base text-white drop-shadow-md">
                  {pad.label[0]}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
