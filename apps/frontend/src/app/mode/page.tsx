'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import { gameService } from '@/services/game.service';
import { toast } from 'sonner';
import { Zap, ZapOff, Gamepad2, ChevronLeft, ChevronRight } from 'lucide-react';

const MODES = [
  { name: 'EASY', description: 'Fast & Simple', color: 'from-emerald-400 to-cyan-500', icon: ZapOff },
  { name: 'MEDIUM', description: 'Balanced Challenge', color: 'from-amber-400 to-orange-500', icon: Zap },
  { name: 'HARD', description: 'Ultimate Test', color: 'from-red-400 to-pink-500', icon: Zap },
];

export default function ModePage() {
  const router = useRouter();
  const { socket } = useSocket();
  const [selectedIndex, setSelectedIndex] = useState(1);
  const [selecting, setSelecting] = useState(false);
  const [starting, setStarting] = useState(false);

  // Listen for IoT device:start event
  useEffect(() => {
    if (!socket) return;

    const handleDeviceStart = () => {
      setSelecting(true);
      toast.success(`Starting ${MODES[selectedIndex].name} mode!`);
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    };

    socket.on('device:start', handleDeviceStart);

    return () => {
      socket.off('device:start', handleDeviceStart);
    };
  }, [socket, router, selectedIndex]);

  // Listen for IoT mode change events
  useEffect(() => {
    if (!socket) return;

    const handleModeChange = (data: { mode: number }) => {
      if (data.mode >= 0 && data.mode < MODES.length) {
        setSelectedIndex(data.mode);
      }
    };

    socket.on('device:mode_change', handleModeChange);

    return () => {
      socket.off('device:mode_change', handleModeChange);
    };
  }, [socket]);

  const handleSelectPrev = () => {
    setSelectedIndex((prev) => (prev - 1 + MODES.length) % MODES.length);
  };

  const handleSelectNext = () => {
    setSelectedIndex((prev) => (prev + 1) % MODES.length);
  };

  const handleStart = async () => {
    if (starting) return;
    setStarting(true);

    try {
      await gameService.setDifficulty(MODES[selectedIndex].name);
      setSelecting(true);
      toast.success(`Starting ${MODES[selectedIndex].name} mode!`);
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch {
      toast.error('Failed to set difficulty. Please try again.');
      setStarting(false);
    }
  };

  return (
    <main className="flex h-screen max-h-screen w-screen flex-col items-center justify-center bg-gradient-to-br from-sky-400 via-blue-500 to-orange-400 relative overflow-hidden text-white p-4">
      
      {/* Selection overlay */}
      {selecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="flex flex-col items-center space-y-6 animate-in zoom-in duration-500">
            <div className={`w-24 h-24 rounded-full bg-gradient-to-r ${MODES[selectedIndex].color} flex items-center justify-center animate-pulse shadow-[0_0_60px_rgba(56,189,248,0.6)]`}>
              <Gamepad2 className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl font-black font-orbitron text-white animate-pulse">{MODES[selectedIndex].name} MODE</h2>
            <p className="text-xl text-cyan-300 font-medium">{MODES[selectedIndex].description}</p>
          </div>
        </div>
      )}

      {/* Background Orbs */}
      <div className="absolute -top-20 -left-20 w-[550px] h-[550px] bg-yellow-200/40 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-20 -right-20 w-[550px] h-[550px] bg-orange-300/40 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Content */}
      <div className="z-10 flex flex-col items-center space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        <div className="text-center">
          <h1 className="text-5xl sm:text-6xl font-black font-orbitron tracking-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
            SELECT MODE
          </h1>
          <p className="text-xl text-white/80 font-medium mt-2">Choose your difficulty</p>
        </div>

        {/* Navigation + Mode Cards */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSelectPrev}
            className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all active:scale-90 cursor-pointer backdrop-blur-sm"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <div className="flex gap-6">
            {MODES.map((mode, index) => {
              const Icon = mode.icon;
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={mode.name}
                  onClick={() => setSelectedIndex(index)}
                  className={`
                    relative w-48 h-48 sm:w-56 sm:h-56 rounded-3xl border-4 transition-all duration-300 cursor-pointer
                    flex flex-col items-center justify-center space-y-3
                    ${isSelected 
                      ? `border-white bg-gradient-to-br ${mode.color} shadow-[0_0_40px_rgba(255,255,255,0.3)] scale-110` 
                      : 'border-white/30 bg-white/10 backdrop-blur-md hover:bg-white/20 hover:scale-105'}
                  `}
                >
                  <Icon className={`w-12 h-12 ${isSelected ? 'text-white' : 'text-white/60'}`} />
                  <h3 className={`text-2xl font-black font-orbitron ${isSelected ? 'text-white' : 'text-white/70'}`}>
                    {mode.name}
                  </h3>
                  <p className={`text-sm font-medium ${isSelected ? 'text-white/90' : 'text-white/50'}`}>
                    {mode.description}
                  </p>
                  {isSelected && (
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-sm font-bold text-slate-800">✓</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleSelectNext}
            className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all active:scale-90 cursor-pointer backdrop-blur-sm"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStart}
          disabled={starting}
          className={`
            px-12 py-4 rounded-full font-black font-orbitron text-xl tracking-wider
            bg-gradient-to-r ${MODES[selectedIndex].color} text-white
            shadow-[0_0_30px_rgba(255,255,255,0.3)]
            transition-all duration-300 hover:scale-105 hover:shadow-[0_0_50px_rgba(255,255,255,0.5)]
            active:scale-95
            disabled:opacity-50 disabled:cursor-not-allowed
            cursor-pointer
          `}
        >
          {starting ? 'STARTING...' : 'START GAME'}
        </button>

        {/* Instructions */}
        <div className="flex items-center gap-6 text-white/70">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
              <span className="text-lg">◀</span>
            </div>
            <span className="text-sm font-medium">Previous</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
              <span className="text-lg">▶</span>
            </div>
            <span className="text-sm font-medium">Next</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-500 flex items-center justify-center border border-white/30">
              <span className="text-lg font-bold">S</span>
            </div>
            <span className="text-sm font-medium">Start</span>
          </div>
        </div>

      </div>
    </main>
  );
}
