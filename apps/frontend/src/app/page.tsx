'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Gamepad2, Play, Sparkles, Trophy, Cpu, Volume2, VolumeX, Music, Zap, Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LeaderboardTable } from '@/features/leaderboard/LeaderboardTable';
import { useSocket } from '@/hooks/useSocket';
import { SOCKET_EVENTS } from '@/constants/socket';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const router = useRouter();
  const { socket } = useSocket();
  const [starting, setStarting] = useState(false);
  const [showSoundModal, setShowSoundModal] = useState(false);
  const [isBgmEnabled, setIsBgmEnabled] = useState(true);
  const [isSfxEnabled, setIsSfxEnabled] = useState(true);

  useEffect(() => {
    if (!socket) return;

    const handleDeviceStart = () => {
      setStarting(true);
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
  }, [socket, router]);

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

  return (
    <main className="flex h-screen max-h-screen w-screen flex-col items-center justify-between bg-gradient-to-br from-sky-400 via-blue-500 to-orange-400 relative overflow-hidden text-white py-4 px-4">
      
      {/* Top Bar Controls (Sound Settings Button) */}
      <div className="absolute top-4 right-4 z-40 flex items-center gap-3">
        <button
          onClick={() => setShowSoundModal(true)}
          title="Sound Settings"
          className="flex items-center gap-2 px-4 py-2 rounded-2xl border-2 border-white/30 bg-white/15 backdrop-blur-xl transition-all duration-300 shadow-lg cursor-pointer hover:bg-white/25 hover:scale-105 active:scale-95 text-white"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              className="max-w-md w-full bg-white/95 backdrop-blur-2xl rounded-[2.5rem] border-4 border-purple-300/40 shadow-2xl p-6 text-slate-900 flex flex-col relative"
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
                <div className="flex items-center justify-between p-4 rounded-2xl bg-purple-50/70 border-2 border-purple-100/80">
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
                <div className="flex items-center justify-between p-4 rounded-2xl bg-purple-50/70 border-2 border-purple-100/80">
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
      
      {/* Overlay animation ตอนกด START */}
      {starting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="flex flex-col items-center space-y-6 animate-in zoom-in duration-500">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 flex items-center justify-center animate-pulse shadow-[0_0_60px_rgba(56,189,248,0.6)]">
              <Play className="w-12 h-12 text-white fill-white" />
            </div>
            <h2 className="text-4xl font-black font-orbitron text-white animate-pulse">STARTING GAME...</h2>
            <p className="text-xl text-cyan-300 font-medium">Get Ready!</p>
          </div>
        </div>
      )}

      {/* Floating Orbs */}
      <div className="absolute -top-20 -left-20 w-[550px] h-[550px] bg-yellow-200/40 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-20 -right-20 w-[550px] h-[550px] bg-orange-300/40 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sky-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="z-10 container mx-auto px-4 flex-1 flex flex-col lg:flex-row items-center justify-between gap-8 max-w-[1400px] min-h-0">
        
        {/* Left Side: Leaderboard */}
        <div className="w-full lg:w-1/2 xl:w-5/12 h-full max-h-[calc(100vh-100px)] py-2 animate-in fade-in slide-in-from-left-8 duration-700">
          <LeaderboardTable />
        </div>

        {/* Right Side: Title & Play Button */}
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
          
          {/* Main Title Banner */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-yellow-300 font-semibold text-sm shadow-inner">
              <Sparkles className="w-4 h-4" />
              <span>Interactive IoT Speed Battle</span>
            </div>
            
            <h1 className="text-6xl sm:text-7xl xl:text-8xl font-black font-orbitron tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-white to-cyan-300 drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)]">
              MEMORY<br />ARENA
            </h1>
            
            <p className="text-lg sm:text-xl text-sky-100 font-medium max-w-lg leading-relaxed drop-shadow">
              Step up, memorize the sequence, and battle your opponent in real-time on real hardware buttons!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link href="/mode" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto h-16 px-10 text-xl font-black font-orbitron tracking-wider rounded-2xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 hover:from-emerald-300 hover:via-cyan-300 hover:to-blue-400 text-slate-950 shadow-[0_0_40px_rgba(52,211,153,0.6)] hover:shadow-[0_0_60px_rgba(52,211,153,0.9)] hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-white/40"
              >
                <Play className="w-6 h-6 mr-3 fill-slate-950" />
                START BATTLE
              </Button>
            </Link>

            <Link href="/login" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto h-16 px-8 text-lg font-bold font-orbitron tracking-wider rounded-2xl bg-white/10 hover:bg-white/20 border-2 border-white/40 text-white backdrop-blur-md shadow-lg hover:scale-105 active:scale-95 transition-all duration-300"
              >
                PLAYER LOGIN
              </Button>
            </Link>
          </div>

          {/* Feature Badges */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
            <div className="flex items-center gap-2 border-2 border-white/20 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-sm">
              <Gamepad2 className="w-5 h-5 text-cyan-300" />
              <span className="text-sm font-bold tracking-wider font-orbitron text-white">2 PLAYERS</span>
            </div>
            <div className="flex items-center gap-2 border-2 border-white/20 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-sm">
              <Cpu className="w-5 h-5 text-amber-300" />
              <span className="text-sm font-bold tracking-wider font-orbitron text-white">ESP32 HARDWARE</span>
            </div>
            <div className="flex items-center gap-2 border-2 border-white/20 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-sm">
              <Trophy className="w-5 h-5 text-pink-300" />
              <span className="text-sm font-bold tracking-wider font-orbitron text-white">BEST OF 5</span>
            </div>
          </div>

        </div>

      </div>

      {/* Footer */}
      <footer className="z-10 pb-3 text-center text-[11px] font-mono text-white/40 hover:text-white/80 transition-opacity">
        Created by Nus Peerapat
      </footer>
    </main>
  );
}
