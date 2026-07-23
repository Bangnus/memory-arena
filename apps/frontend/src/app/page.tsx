import Link from 'next/link';
import { Gamepad2, Play, Sparkles, Trophy, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LeaderboardTable } from '@/features/leaderboard/LeaderboardTable';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 relative overflow-hidden text-white">
      
      {/* Playful Bright Floating Orbs */}
      <div className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-cyan-300/30 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-yellow-300/30 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] bg-pink-400/20 rounded-full blur-3xl pointer-events-none" />

      <div className="z-10 container mx-auto px-4 py-8 flex flex-col lg:flex-row items-center justify-between gap-12 max-w-[1400px]">
        
        {/* Left Side: Leaderboard */}
        <div className="w-full lg:w-1/2 xl:w-5/12 h-[650px] animate-in fade-in slide-in-from-left-8 duration-700">
          <LeaderboardTable />
        </div>

        {/* Right Side: Title & Play Button */}
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black px-4 py-1.5 rounded-full text-sm shadow-lg transform -rotate-1">
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>2-PLAYER MEMORY BATTLE</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black font-orbitron tracking-tight leading-none text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
              MEMORY<br/>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-amber-300 to-pink-400">
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
    </main>
  );
}
