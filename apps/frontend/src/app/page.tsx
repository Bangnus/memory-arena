'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Gamepad2, Play, Sparkles, Trophy, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LeaderboardTable } from '@/features/leaderboard/LeaderboardTable';
import { useSocket } from '@/hooks/useSocket';
import { SOCKET_EVENTS } from '@/constants/socket';
import { toast } from 'sonner';

export default function Home() {
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const handleDeviceStart = () => {
      setStarting(true);
      toast.info('Game starting from IoT device!');
      setTimeout(() => {
        router.push('/mode');
      }, 2000);
    };

    socket.on(SOCKET_EVENTS.DEVICE_START, handleDeviceStart);

    return () => {
      socket.off(SOCKET_EVENTS.DEVICE_START, handleDeviceStart);
    };
  }, [socket, router]);

  return (
    <main className="flex h-screen max-h-screen w-screen flex-col items-center justify-between bg-gradient-to-br from-sky-400 via-blue-500 to-orange-400 relative overflow-hidden text-white py-4 px-4">
      
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
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 text-slate-950 font-black px-4 py-1.5 rounded-full text-sm shadow-lg transform -rotate-1">
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>RMUT MEMORY BATTLE ARENA</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black font-orbitron tracking-tight leading-none text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
              MEMORY<br/>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-400">
                ARENA
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-purple-100/90 font-medium max-w-xl">
              Remember the light pattern, tap the sequence fast, and beat your friend in real-time! ⚡
            </p>
          </div>

          <div className="w-full max-w-sm pt-2">
            <Button 
              asChild 
              className="w-full h-20 text-3xl font-orbitron font-black tracking-wider rounded-3xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 hover:from-emerald-300 hover:to-blue-400 text-slate-950 shadow-[0_8px_30px_rgba(56,189,248,0.4)] hover:scale-105 active:scale-95 transition-all duration-300 border-4 border-white/20"
            >
              <Link href="/login" className="flex items-center justify-center gap-3">
                <Play className="w-8 h-8 fill-slate-950" />
                START GAME
              </Link>
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-4 pt-4 justify-center lg:justify-start">
            <div className="flex items-center gap-2 border-2 border-white/20 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-sm">
              <Gamepad2 className="w-5 h-5 text-cyan-300" />
              <span className="text-sm font-bold tracking-wider font-orbitron text-white">REALTIME 2P</span>
            </div>
            <div className="flex items-center gap-2 border-2 border-white/20 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-sm">
              <Cpu className="w-5 h-5 text-amber-300" />
              <span className="text-sm font-bold tracking-wider font-orbitron text-white">ESP32 HARDWARE</span>
            </div>
            <div className="flex items-center gap-2 border-2 border-white/20 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-sm">
              <Trophy className="w-5 h-5 text-pink-300" />
              <span className="text-sm font-bold tracking-wider font-orbitron text-white">BEST OF 3</span>
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
