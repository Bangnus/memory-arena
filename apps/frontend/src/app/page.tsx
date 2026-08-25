'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Play, Volume2, VolumeX, BookOpen, Users, Cpu, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LeaderboardTable } from '@/features/leaderboard/LeaderboardTable';
import { useSocket } from '@/hooks/useSocket';
import { SOCKET_EVENTS } from '@/constants/socket';
import { HowToPlayModal } from '@/features/home/HowToPlayModal';
import { SoundSettingsModal } from '@/features/home/SoundSettingsModal';
import { CceBranding } from '@/features/home/CceBranding';
import { InteractiveSimonPads } from '@/features/home/InteractiveSimonPads';

export default function Home() {
  const router = useRouter();
  const { socket } = useSocket();
  const [starting, setStarting] = useState(false);
  const [showSoundModal, setShowSoundModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [isBgmEnabled, setIsBgmEnabled] = useState(true);
  const [isSfxEnabled, setIsSfxEnabled] = useState(true);

  // Load sound settings from localStorage on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedBgm = localStorage.getItem('sound_bgm_enabled');
      const savedSfx = localStorage.getItem('sound_sfx_enabled');
      if (savedBgm !== null) setIsBgmEnabled(savedBgm === 'true');
      if (savedSfx !== null) setIsSfxEnabled(savedSfx === 'true');
    }
  }, []);

  // Socket and IoT synchronization
  useEffect(() => {
    if (!socket) return;

    socket.emit('device:standby');

    const savedBgm = typeof window !== 'undefined' ? localStorage.getItem('sound_bgm_enabled') : null;
    const savedSfx = typeof window !== 'undefined' ? localStorage.getItem('sound_sfx_enabled') : null;
    const currentBgm = savedBgm !== null ? savedBgm === 'true' : true;
    const currentSfx = savedSfx !== null ? savedSfx === 'true' : true;
    socket.emit('device:sound', { bgm: currentBgm, sfx: currentSfx });

    const handleDeviceStart = () => {
      setStarting(true);
      setTimeout(() => {
        router.push('/mode');
      }, 1200);
    };

    const handleSoundChange = (data: { bgm?: boolean; sfx?: boolean; enabled?: boolean }) => {
      if (data.bgm !== undefined) {
        setIsBgmEnabled(data.bgm);
        if (typeof window !== 'undefined') localStorage.setItem('sound_bgm_enabled', String(data.bgm));
      }
      if (data.sfx !== undefined) {
        setIsSfxEnabled(data.sfx);
        if (typeof window !== 'undefined') localStorage.setItem('sound_sfx_enabled', String(data.sfx));
      }
    };

    socket.on(SOCKET_EVENTS.DEVICE_START, handleDeviceStart);
    socket.on('device:sound', handleSoundChange);

    return () => {
      socket.off(SOCKET_EVENTS.DEVICE_START, handleDeviceStart);
      socket.off('device:sound', handleSoundChange);
    };
  }, [socket, router]);

  const handleStartGameClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setStarting(true);
    setTimeout(() => {
      router.push('/mode');
    }, 1200);
  };

  const toggleBgm = () => {
    const nextBgm = !isBgmEnabled;
    setIsBgmEnabled(nextBgm);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sound_bgm_enabled', String(nextBgm));
    }
    if (socket) {
      socket.emit('device:sound', { bgm: nextBgm, sfx: isSfxEnabled });
    }
  };

  const toggleSfx = () => {
    const nextSfx = !isSfxEnabled;
    setIsSfxEnabled(nextSfx);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sound_sfx_enabled', String(nextSfx));
    }
    if (socket) {
      socket.emit('device:sound', { bgm: isBgmEnabled, sfx: nextSfx });
    }
  };

  return (
    <main className="flex h-screen max-h-screen w-screen flex-col items-center justify-between bg-gradient-to-br from-sky-400 via-blue-500 to-orange-400 relative overflow-hidden text-white py-4 px-4 select-none">
      {/* Background Cyber Grid / Ambient Energy Field */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-60" />

      {/* Floating Animated Orbs */}
      <motion.div
        animate={{ y: [-15, 15, -15], scale: [1, 1.08, 1], opacity: [0.35, 0.5, 0.35] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-20 -left-20 w-[550px] h-[550px] bg-yellow-200/40 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ y: [15, -15, 15], scale: [1.08, 1, 1.08], opacity: [0.35, 0.5, 0.35] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-20 -right-20 w-[550px] h-[550px] bg-orange-300/40 rounded-full blur-3xl pointer-events-none"
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sky-200/30 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar Controls */}
      <div className="absolute top-4 right-4 z-40 flex items-center gap-2 sm:gap-3">
        <button
          onClick={() => setShowRulesModal(true)}
          title="วิธีการเล่น / How to Play"
          className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-2xl border border-white/40 bg-white/15 backdrop-blur-xl transition-all duration-300 shadow-xl cursor-pointer hover:bg-white/25 hover:scale-105 active:scale-95 text-white"
        >
          <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
          <span className="text-xs font-black font-orbitron tracking-wider">HOW TO PLAY</span>
        </button>

        <button
          onClick={() => setShowSoundModal(true)}
          title="Sound Settings"
          className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-2xl border border-white/40 bg-white/15 backdrop-blur-xl transition-all duration-300 shadow-xl cursor-pointer hover:bg-white/25 hover:scale-105 active:scale-95 text-white"
        >
          {!isBgmEnabled && !isSfxEnabled ? (
            <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-rose-300" />
          ) : (
            <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 animate-pulse" />
          )}
          <span className="text-xs font-black font-orbitron tracking-wider">SOUND SETTINGS</span>
        </button>
      </div>

      {/* Modals */}
      <HowToPlayModal isOpen={showRulesModal} onClose={() => setShowRulesModal(false)} />
      <SoundSettingsModal
        isOpen={showSoundModal}
        onClose={() => setShowSoundModal(false)}
        isBgmEnabled={isBgmEnabled}
        isSfxEnabled={isSfxEnabled}
        onToggleBgm={toggleBgm}
        onToggleSfx={toggleSfx}
      />

      {/* Classic Overlay animation on START */}
      {starting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="flex flex-col items-center space-y-6 animate-in zoom-in duration-500">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 flex items-center justify-center animate-pulse shadow-[0_0_60px_rgba(56,189,248,0.6)]">
              <Play className="w-12 h-12 text-white fill-white ml-1" />
            </div>
            <h2 className="text-4xl font-black font-orbitron text-white animate-pulse">STARTING GAME...</h2>
            <p className="text-xl text-cyan-300 font-medium">Get Ready!</p>
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
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left space-y-5 animate-in fade-in slide-in-from-right-8 duration-700">
          {/* Header Title Section with CCE Branding */}
          <div className="space-y-1 sm:space-y-1.5 flex flex-col items-center lg:items-start">
            {/* CCE Department Branding Component */}
            <CceBranding />

            {/* Hero Title */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black font-orbitron tracking-tight leading-none text-white drop-shadow-[0_6px_20px_rgba(0,0,0,0.5)] pt-1">
              MEMORY<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-400 animate-pulse">
                ARENA
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-sky-100/90 font-medium max-w-xl pt-1">
              Real-time 2-Player IoT Battle • Fast-paced memory duel powered by ESP32 and Next.js
            </p>
          </div>

          {/* Interactive Hardware Simon Pads Preview */}
          <InteractiveSimonPads />

          {/* Play Button */}
          <div className="w-full max-w-sm pt-2 relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 rounded-3xl blur-md opacity-60 animate-pulse" />
            <Button
              onClick={handleStartGameClick}
              className="relative w-full h-18 text-2xl sm:text-3xl font-orbitron font-black tracking-wider rounded-3xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 hover:from-emerald-300 hover:to-blue-400 text-slate-950 shadow-[0_8px_35px_rgba(56,189,248,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-white/40 cursor-pointer"
            >
              <div className="flex items-center justify-center gap-3">
                <Play className="w-8 h-8 fill-current" />
                <span>START GAME</span>
              </div>
            </Button>
          </div>

          {/* Feature Badges */}
          <div className="flex flex-wrap gap-3 pt-2 justify-center lg:justify-start">
            <motion.div whileHover={{ scale: 1.05, y: -2 }} className="flex items-center gap-2 border border-white/30 bg-white/15 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg">
              <Users className="w-5 h-5 text-amber-300" />
              <span className="text-xs font-black font-orbitron">2 PLAYERS</span>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, y: -2 }} className="flex items-center gap-2 border border-white/30 bg-white/15 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg">
              <Cpu className="w-5 h-5 text-emerald-300" />
              <span className="text-xs font-black font-orbitron">ESP32 HARDWARE</span>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, y: -2 }} className="flex items-center gap-2 border border-white/30 bg-white/15 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg">
              <Trophy className="w-5 h-5 text-yellow-300" />
              <span className="text-xs font-black font-orbitron">LIVE RANKING</span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="z-10 pb-2 text-center text-[11px] sm:text-xs font-mono text-white/60 hover:text-white/95 transition-opacity flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2">
        <div className="flex items-center gap-1.5">
          <Image
            src="/logo-cce.png"
            alt="CCE Logo"
            width={16}
            height={16}
            className="w-4 h-4 object-contain rounded-sm"
          />
          <span className="font-bold text-sky-200">Computer and Communication Engineering</span>
        </div>
        <span className="hidden sm:inline text-white/40">•</span>
        <span>Memory Arena • Developed by Nus Peerapat</span>
      </footer>
    </main>
  );
}
