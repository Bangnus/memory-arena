'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Gamepad2, Play, Sparkles, Trophy, Cpu, Volume2, VolumeX, Music, Zap, X, Swords } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LeaderboardTable } from '@/features/leaderboard/LeaderboardTable';
import { useSocket } from '@/hooks/useSocket';
import { useSound } from '@/hooks/useSound';
import { SOCKET_EVENTS } from '@/constants/socket';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const GAME_PADS = [
  { id: 'RED', label: 'RED', bg: 'bg-rose-500', glow: 'shadow-[0_0_25px_rgba(244,63,94,0.7)]', activeGlow: 'bg-rose-400 shadow-[0_0_40px_rgba(244,63,94,1)] scale-110', border: 'border-rose-300' },
  { id: 'GREEN', label: 'GREEN', bg: 'bg-emerald-500', glow: 'shadow-[0_0_25px_rgba(16,185,129,0.7)]', activeGlow: 'bg-emerald-400 shadow-[0_0_40px_rgba(16,185,129,1)] scale-110', border: 'border-emerald-300' },
  { id: 'BLUE', label: 'BLUE', bg: 'bg-sky-500', glow: 'shadow-[0_0_25px_rgba(14,165,233,0.7)]', activeGlow: 'bg-sky-400 shadow-[0_0_40px_rgba(14,165,233,1)] scale-110', border: 'border-sky-300' },
  { id: 'YELLOW', label: 'YELLOW', bg: 'bg-amber-400', glow: 'shadow-[0_0_25px_rgba(251,191,36,0.7)]', activeGlow: 'bg-amber-300 shadow-[0_0_40px_rgba(251,191,36,1)] scale-110', border: 'border-amber-200' },
];

export default function Home() {
  const router = useRouter();
  const { socket } = useSocket();
  const { playButtonPress, playGameStart } = useSound();
  const [starting, setStarting] = useState(false);
  const [showSoundModal, setShowSoundModal] = useState(false);
  const [isBgmEnabled, setIsBgmEnabled] = useState(true);
  const [isSfxEnabled, setIsSfxEnabled] = useState(true);
  const [activePad, setActivePad] = useState<string | null>(null);

  // Attract Mode: Ambient cycling sequence simulation on home screen
  useEffect(() => {
    const sequenceOrder = ['RED', 'BLUE', 'YELLOW', 'GREEN', 'RED', 'YELLOW', 'GREEN', 'BLUE'];
    let step = 0;
    const interval = setInterval(() => {
      setActivePad(sequenceOrder[step % sequenceOrder.length]);
      setTimeout(() => setActivePad(null), 450);
      step++;
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleDeviceStart = () => {
      setStarting(true);
      playGameStart();
      toast.info('Game starting from IoT device!');
      setTimeout(() => {
        router.push('/mode');
      }, 400);
    };

    const handleSoundChange = (data: { bgm?: boolean; sfx?: boolean; enabled?: boolean }) => {
      if (data.bgm !== undefined) setIsBgmEnabled(data.bgm);
      if (data.sfx !== undefined) setIsSfxEnabled(data.sfx);
      if (data.enabled !== undefined && data.bgm === undefined && data.sfx === undefined) {
        setIsBgmEnabled(data.enabled);
        setIsSfxEnabled(data.enabled);
      }
    };

    socket.on(SOCKET_EVENTS.DEVICE_START, handleDeviceStart);
    socket.on('device:sound', handleSoundChange);

    return () => {
      socket.off(SOCKET_EVENTS.DEVICE_START, handleDeviceStart);
      socket.off('device:sound', handleSoundChange);
    };
  }, [socket, router, playGameStart]);

  const toggleBgm = () => {
    if (!socket) return;
    const nextBgm = !isBgmEnabled;
    setIsBgmEnabled(nextBgm);
    socket.emit('device:sound', { bgm: nextBgm, sfx: isSfxEnabled });
    toast.info(nextBgm ? 'Music Enabled 🎵' : 'Music Muted 🔇', { duration: 1500 });
  };

  const toggleSfx = () => {
    if (!socket) return;
    const nextSfx = !isSfxEnabled;
    setIsSfxEnabled(nextSfx);
    socket.emit('device:sound', { bgm: isBgmEnabled, sfx: nextSfx });
    toast.info(nextSfx ? 'Sound Effects Enabled ⚡' : 'Sound Effects Muted 🔇', { duration: 1500 });
  };

  const handlePadClick = (id: string) => {
    setActivePad(id);
    playButtonPress();
    setTimeout(() => setActivePad(null), 300);
  };

  return (
    <main className="flex h-screen max-h-screen w-screen flex-col items-center justify-between bg-gradient-to-br from-sky-500 via-indigo-600 to-orange-500 relative overflow-hidden text-white py-4 px-4 select-none">
      
      {/* Background Cyber Grid / Ambient Energy Field */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-60" />
      
      {/* Floating Animated Orbs */}
      <motion.div 
        animate={{ y: [-15, 15, -15], scale: [1, 1.1, 1], opacity: [0.35, 0.5, 0.35] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-sky-300/40 rounded-full blur-[120px] pointer-events-none" 
      />
      <motion.div 
        animate={{ y: [15, -15, 15], scale: [1.1, 1, 1.1], opacity: [0.35, 0.5, 0.35] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-24 -right-24 w-[550px] h-[550px] bg-orange-400/40 rounded-full blur-[120px] pointer-events-none" 
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-purple-500/20 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Bar Controls (Sound Settings Button) */}
      <div className="absolute top-4 right-4 z-40 flex items-center gap-3">
        <button
          onClick={() => setShowSoundModal(true)}
          title="Sound Settings"
          className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-white/40 bg-white/15 backdrop-blur-xl transition-all duration-300 shadow-xl cursor-pointer hover:bg-white/25 hover:scale-105 active:scale-95 text-white"
        >
          {(!isBgmEnabled && !isSfxEnabled) ? (
            <VolumeX className="w-5 h-5 text-rose-300" />
          ) : (
            <Volume2 className="w-5 h-5 text-amber-300 animate-pulse" />
          )}
          <span className="text-xs font-black font-orbitron tracking-wider">SOUND SETTINGS</span>
        </button>
      </div>

      {/* Sound Settings Modal */}
      <AnimatePresence>
        {showSoundModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              className="max-w-md w-full bg-white/95 backdrop-blur-2xl rounded-[2.5rem] border-2 border-white/60 shadow-2xl p-6 text-slate-900 flex flex-col relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowSoundModal(false)}
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
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isBgmEnabled ? 'bg-amber-400 text-amber-950' : 'bg-slate-200 text-slate-500'}`}>
                      <Music className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-800">Background Music</div>
                      <div className="text-xs text-slate-500">Standby Pokemon Center theme</div>
                    </div>
                  </div>

                  <button
                    onClick={toggleBgm}
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
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSfxEnabled ? 'bg-cyan-400 text-cyan-950' : 'bg-slate-200 text-slate-500'}`}>
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-800">Sound Effects</div>
                      <div className="text-xs text-slate-500">Buttons, Countdown & Fanfares</div>
                    </div>
                  </div>

                  <button
                    onClick={toggleSfx}
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
                onClick={() => setShowSoundModal(false)}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 text-slate-950 font-orbitron font-black text-sm shadow-lg hover:scale-102 transition-all cursor-pointer"
              >
                SAVE & CLOSE
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Overlay animation on START */}
      {starting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
          <div className="flex flex-col items-center space-y-6 animate-in zoom-in duration-500">
            <div className="w-28 h-28 rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 flex items-center justify-center animate-pulse shadow-[0_0_80px_rgba(56,189,248,0.8)]">
              <Play className="w-14 h-14 text-white fill-white ml-1" />
            </div>
            <h2 className="text-4xl font-black font-orbitron text-white tracking-widest animate-bounce">STARTING BATTLE...</h2>
            <p className="text-lg text-cyan-300 font-bold font-orbitron">GET READY!</p>
          </div>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="z-10 container mx-auto px-4 flex-1 flex flex-col lg:flex-row items-center justify-between gap-8 max-w-[1400px] min-h-0">
        
        {/* Left Side: Leaderboard */}
        <div className="w-full lg:w-1/2 xl:w-5/12 h-full max-h-[calc(100vh-100px)] py-2 animate-in fade-in slide-in-from-left-8 duration-700">
          <LeaderboardTable />
        </div>

        {/* Right Side: Title, Interactive Color Pads & Play Button */}
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 animate-in fade-in slide-in-from-right-8 duration-700">
          
          {/* Top Live Badge */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 text-slate-950 font-black px-4 py-1.5 rounded-full text-xs sm:text-sm shadow-xl font-orbitron tracking-wide"
          >
            <Swords className="w-4 h-4 fill-slate-950" />
            <span>2-PLAYER IOT MEMORY BATTLE</span>
            <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping ml-1" />
          </motion.div>

          {/* Hero Title */}
          <div className="space-y-2">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black font-orbitron tracking-tight leading-none text-white drop-shadow-[0_6px_20px_rgba(0,0,0,0.5)]">
              MEMORY<br/>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-400 animate-pulse">
                ARENA
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-sky-100/90 font-medium max-w-xl">
              Remember the light pattern, tap the sequence at lightning speed, and outsmart your opponent in real-time! ⚡
            </p>
          </div>

          {/* Interactive Live 4-Color Simon Pads Preview */}
          <div className="flex flex-col items-center lg:items-start gap-2 pt-1">
            <span className="text-[11px] font-bold font-orbitron text-white/70 tracking-widest uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Interactive Color Console</span>
            </span>
            <div className="flex items-center gap-3 p-3 bg-white/15 backdrop-blur-xl rounded-2xl border border-white/30 shadow-2xl">
              {GAME_PADS.map((pad) => {
                const isActive = activePad === pad.id;
                return (
                  <button
                    key={pad.id}
                    onClick={() => handlePadClick(pad.id)}
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 ${pad.border} ${pad.bg} transition-all duration-200 flex items-center justify-center cursor-pointer transform active:scale-90 ${
                      isActive ? pad.activeGlow : `${pad.glow} hover:scale-105 hover:brightness-110`
                    }`}
                  >
                    <span className="font-orbitron font-black text-xs text-white drop-shadow-md">
                      {pad.label[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Start Game Action Button */}
          <div className="w-full max-w-sm pt-2 relative">
            {/* Glowing energy back-pulse */}
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 rounded-3xl blur-md opacity-60 animate-pulse" />
            
            <Button 
              asChild 
              className="relative w-full h-18 text-2xl sm:text-3xl font-orbitron font-black tracking-wider rounded-3xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 hover:from-emerald-300 hover:to-blue-400 text-slate-950 shadow-[0_8px_35px_rgba(56,189,248,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-white/40 cursor-pointer"
            >
              <Link href="/mode" className="flex items-center justify-center gap-3">
                <Play className="w-7 h-7 fill-slate-950" />
                START BATTLE
              </Link>
            </Button>
          </div>
          
          {/* Feature Badges */}
          <div className="flex flex-wrap gap-3 pt-2 justify-center lg:justify-start">
            <motion.div whileHover={{ scale: 1.05, y: -2 }} className="flex items-center gap-2 border border-white/30 bg-white/15 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg">
              <Gamepad2 className="w-4 h-4 text-cyan-300" />
              <span className="text-xs font-bold tracking-wider font-orbitron text-white">REALTIME 2P</span>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, y: -2 }} className="flex items-center gap-2 border border-white/30 bg-white/15 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg">
              <Cpu className="w-4 h-4 text-amber-300" />
              <span className="text-xs font-bold tracking-wider font-orbitron text-white">ESP32 HARDWARE</span>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, y: -2 }} className="flex items-center gap-2 border border-white/30 bg-white/15 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg">
              <Trophy className="w-4 h-4 text-pink-300" />
              <span className="text-xs font-bold tracking-wider font-orbitron text-white">BEST OF 5</span>
            </motion.div>
          </div>

        </div>

      </div>

      {/* Footer */}
      <footer className="z-10 pb-2 text-center text-[11px] font-mono text-white/50 hover:text-white/90 transition-opacity">
        Memory Arena • Developed by Nus Peerapat
      </footer>
    </main>
  );
}

