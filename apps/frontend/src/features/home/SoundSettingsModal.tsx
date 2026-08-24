'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Music, Zap, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ISoundSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isBgmEnabled: boolean;
  isSfxEnabled: boolean;
  onToggleBgm: () => void;
  onToggleSfx: () => void;
}

export function SoundSettingsModal({
  isOpen,
  onClose,
  isBgmEnabled,
  isSfxEnabled,
  onToggleBgm,
  onToggleSfx,
}: ISoundSettingsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 15 }}
            className="max-w-md w-full bg-white/95 backdrop-blur-2xl rounded-[2.5rem] border-2 border-white/60 shadow-2xl p-6 text-slate-900 flex flex-col relative"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center shadow-md">
                <Volume2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black font-orbitron text-slate-900 tracking-wide">SOUND SETTINGS</h3>
                <p className="text-xs font-medium text-slate-500">Customize background music and SFX</p>
              </div>
            </div>

            {/* Toggles Container */}
            <div className="space-y-4 mb-6">
              {/* 1. Background Music */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-purple-50/70 border border-purple-100">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isBgmEnabled ? 'bg-amber-400 text-amber-950' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    <Music className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-800">Background Music</div>
                    <div className="text-xs text-slate-500">Standby Pokemon Center theme</div>
                  </div>
                </div>

                <button
                  onClick={onToggleBgm}
                  className={`px-4 py-1.5 rounded-full font-orbitron font-black text-xs transition-all duration-200 shadow-sm cursor-pointer ${
                    isBgmEnabled
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/30'
                      : 'bg-slate-300 text-slate-700 hover:bg-slate-400'
                  }`}
                >
                  {isBgmEnabled ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* 2. Sound Effects */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-purple-50/70 border border-purple-100">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isSfxEnabled ? 'bg-cyan-400 text-cyan-950' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-800">Sound Effects</div>
                    <div className="text-xs text-slate-500">Buttons, Countdown & Fanfares</div>
                  </div>
                </div>

                <button
                  onClick={onToggleSfx}
                  className={`px-4 py-1.5 rounded-full font-orbitron font-black text-xs transition-all duration-200 shadow-sm cursor-pointer ${
                    isSfxEnabled
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/30'
                      : 'bg-slate-300 text-slate-700 hover:bg-slate-400'
                  }`}
                >
                  {isSfxEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            {/* Done Button */}
            <Button
              onClick={onClose}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 text-slate-950 font-orbitron font-black text-sm shadow-lg hover:scale-102 transition-all cursor-pointer"
            >
              SAVE & CLOSE
            </Button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
