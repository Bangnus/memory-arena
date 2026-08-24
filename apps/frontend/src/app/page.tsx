'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Gamepad2, Play, Sparkles, Trophy, Cpu, Volume2, VolumeX, Music, Zap, X, Swords, BookOpen, Info, CheckCircle2, AlertTriangle, Timer } from 'lucide-react';
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
  const { playButtonPress } = useSound();
  const [starting, setStarting] = useState(false);
  const [showSoundModal, setShowSoundModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [isBgmEnabled, setIsBgmEnabled] = useState<boolean>(true);
  const [isSfxEnabled, setIsSfxEnabled] = useState<boolean>(true);
  const [activePad, setActivePad] = useState<string | null>(null);

  // Load sound settings from localStorage on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedBgm = localStorage.getItem('sound_bgm_enabled');
      const savedSfx = localStorage.getItem('sound_sfx_enabled');
      if (savedBgm !== null) setIsBgmEnabled(savedBgm === 'true');
      if (savedSfx !== null) setIsSfxEnabled(savedSfx === 'true');
    }
  }, []);

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

    // Notify IoT and backend that player is on Home page to resume Standby theme
    socket.emit('device:standby');

    // Sync saved sound preferences to connected device
    const savedBgm = typeof window !== 'undefined' ? localStorage.getItem('sound_bgm_enabled') : null;
    const savedSfx = typeof window !== 'undefined' ? localStorage.getItem('sound_sfx_enabled') : null;
    const currentBgm = savedBgm !== null ? savedBgm === 'true' : true;
    const currentSfx = savedSfx !== null ? savedSfx === 'true' : true;
    socket.emit('device:sound', { bgm: currentBgm, sfx: currentSfx });

    const handleDeviceStart = () => {
      setStarting(true);
      toast.info('Game starting from IoT device!');
      setTimeout(() => {
        router.push('/mode');
      }, 400);
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
      if (data.enabled !== undefined && data.bgm === undefined && data.sfx === undefined) {
        setIsBgmEnabled(data.enabled);
        setIsSfxEnabled(data.enabled);
        if (typeof window !== 'undefined') {
          localStorage.setItem('sound_bgm_enabled', String(data.enabled));
          localStorage.setItem('sound_sfx_enabled', String(data.enabled));
        }
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
    const nextBgm = !isBgmEnabled;
    setIsBgmEnabled(nextBgm);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sound_bgm_enabled', String(nextBgm));
    }
    if (socket) {
      socket.emit('device:sound', { bgm: nextBgm, sfx: isSfxEnabled });
    }
    toast.info(nextBgm ? 'Music Enabled 🎵' : 'Music Muted 🔇', { duration: 1500 });
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
    toast.info(nextSfx ? 'Sound Effects Enabled ⚡' : 'Sound Effects Muted 🔇', { duration: 1500 });
  };

  const handlePadClick = (id: string) => {
    setActivePad(id);
    playButtonPress();
    setTimeout(() => setActivePad(null), 300);
  };

  return (
    <main className="flex h-screen max-h-screen w-screen flex-col items-center justify-between bg-gradient-to-br from-sky-400 via-blue-500 to-orange-400 relative overflow-hidden text-white py-4 px-4 select-none">
      
      {/* Background Cyber Grid / Ambient Energy Field */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-60" />
      
      {/* Floating Animated Orbs (Original Colors with smooth motion) */}
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

      {/* Top Bar Controls (How to Play & Sound Settings Buttons) */}
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
          {(!isBgmEnabled && !isSfxEnabled) ? (
            <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-rose-300" />
          ) : (
            <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 animate-pulse" />
          )}
          <span className="text-xs font-black font-orbitron tracking-wider">SOUND SETTINGS</span>
        </button>
      </div>

      {/* How to Play / Rules Modal */}
      <AnimatePresence>
        {showRulesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              className="max-w-2xl w-full max-h-[85vh] bg-white/95 backdrop-blur-2xl rounded-[2.5rem] border-2 border-white/60 shadow-2xl p-6 sm:p-7 text-slate-900 flex flex-col relative overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowRulesModal(false)}
                className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3.5 mb-4 shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-400 to-rose-500 text-white flex items-center justify-center shadow-lg transform -rotate-3">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black font-orbitron text-slate-900 tracking-wide">
                    HOW TO PLAY
                  </h3>
                  <p className="text-xs font-semibold text-purple-600">กติกาและวิธีการเล่น Memory Arena 🎮</p>
                </div>
              </div>

              {/* Scrollable Rules Content */}
              <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1.5 space-y-4 text-xs sm:text-sm">
                
                {/* 1. Format Banner */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-sky-500/10 border border-purple-200/80 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 font-orbitron font-black text-sm">
                    2P
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">รูปแบบการแข่งขัน: Best of 3 (ชนะ 2 ใน 3 รอบ)</div>
                    <div className="text-slate-600 text-xs">ผู้เล่น 2 คนแข่งขันความจำและความเร็วแบบ Realtime ผ่านปุ่มฮาร์ดแวร์ IoT</div>
                  </div>
                </div>

                {/* 2. Step by Step Guide */}
                <div className="space-y-2.5">
                  <div className="font-orbitron font-black text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>ขั้นตอนการเล่น (3 ขั้นตอน)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Step 1 */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                      <div>
                        <div className="w-7 h-7 rounded-lg bg-sky-500 text-white font-orbitron font-black text-xs flex items-center justify-center mb-1.5 shadow-sm">
                          1
                        </div>
                        <div className="font-bold text-slate-800 text-xs">จำโจทย์ไฟ LED</div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                          สัญญาณไฟ 4 สีจะกะพริบตามลำดับ <span className="text-rose-500 font-bold">ห้ามกดปุ่มระหว่างแสดงโจทย์</span>
                        </p>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                      <div>
                        <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-orbitron font-black text-xs flex items-center justify-center mb-1.5 shadow-sm">
                          2
                        </div>
                        <div className="font-bold text-slate-800 text-xs">กดตอบตามลำดับ</div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                          เมื่อโจทย์จบ ให้กดปุ่ม 🔴 🟢 🔵 🟡 ตามลำดับที่จำได้ทีละปุ่มให้เร็วที่สุด
                        </p>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                      <div>
                        <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white font-orbitron font-black text-xs flex items-center justify-center mb-1.5 shadow-sm">
                          3
                        </div>
                        <div className="font-bold text-slate-800 text-xs">ผู้ชนะในรอบ</div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                          คนที่กด<span className="text-emerald-600 font-bold">ถูกต้องครบก่อน</span>จะได้ 1 แต้มในรอบนั้นทันที
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Important Rules & Penalties */}
                <div className="space-y-2">
                  <div className="font-orbitron font-black text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                    <span>กฎสำคัญและเงื่อนไขแพ้-ชนะ</span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-700 bg-rose-50/60 p-3 rounded-2xl border border-rose-100">
                    <div className="flex items-start gap-2">
                      <span className="text-rose-500 font-bold">⚠️</span>
                      <span><strong>กดผิดแพ้ทันที (Instant Loss):</strong> หากกดผิดลำดับจากโจทย์ จะถูกปรับแพ้ในรอบนั้นทันที และให้อีกฝั่งได้คะแนน</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">⏱️</span>
                      <span><strong>เวลาตอบ 15 วินาที:</strong> หากหมดเวลาหรือกดผิดทั้งคู่ รอบนั้นจะถือเป็นโมฆะ (Draw) และสุ่มโจทย์ใหม่เริ่มรอบนั้นใหม่อีกครั้ง</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-indigo-500 font-bold">⚡</span>
                      <span><strong>ห้ามกดค้าง/พร้อมกัน:</strong> ระบบรับข้อมูลแบบ Single-press ทีละปุ่มเพื่อความแม่นยำ</span>
                    </div>
                  </div>
                </div>

                {/* 4. Difficulty Modes */}
                <div className="space-y-2 pb-2">
                  <div className="font-orbitron font-black text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>ระดับความยาก (3 ระดับ)</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                      <div className="font-black text-emerald-700 font-orbitron">EASY</div>
                      <div className="text-[11px] text-slate-600 font-medium">3 ลำดับ (0.8s)</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                      <div className="font-black text-amber-700 font-orbitron">MEDIUM</div>
                      <div className="text-[11px] text-slate-600 font-medium">4 ลำดับ (0.65s)</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
                      <div className="font-black text-rose-700 font-orbitron">HARD</div>
                      <div className="text-[11px] text-slate-600 font-medium">6 ลำดับ (0.45s)</div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Close Button at bottom */}
              <div className="pt-3 shrink-0">
                <Button
                  onClick={() => setShowRulesModal(false)}
                  className="w-full h-11 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-orbitron font-black text-xs sm:text-sm shadow-md hover:scale-101 active:scale-99 transition-all cursor-pointer"
                >
                  GOT IT! • เข้าใจแล้ว
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
          
          {/* CCE Department Badge */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-4 bg-gradient-to-r from-sky-400/35 via-blue-600/40 to-indigo-600/40 hover:from-sky-400/45 hover:to-indigo-600/50 backdrop-blur-2xl border-2 border-white/80 text-white font-black px-6 py-3 rounded-3xl sm:rounded-full shadow-[0_10px_35px_rgba(0,0,0,0.4)] font-orbitron tracking-wider transition-all cursor-default"
          >
            <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl sm:rounded-full bg-white p-1.5 flex items-center justify-center shadow-[0_4px_20px_rgba(255,255,255,0.4)] flex-shrink-0 border-2 border-amber-300">
              <Image 
                src="/logo-cce.png" 
                alt="CCE Logo" 
                width={72} 
                height={72} 
                className="w-full h-full object-contain" 
              />
            </div>
            <span className="text-sm sm:text-base md:text-lg text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] font-black leading-tight">
              COMPUTER & COMMUNICATION ENGINEERING
            </span>
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
              <span className="text-xs font-bold tracking-wider font-orbitron text-white">BEST OF 3</span>
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

