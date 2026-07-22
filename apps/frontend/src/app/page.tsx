import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LeaderboardTable } from '@/features/leaderboard/LeaderboardTable';

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-background/50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="z-10 container mx-auto px-4 py-12 flex flex-col lg:flex-row items-center justify-between gap-12 max-w-7xl">
        
        {/* Left Side: Leaderboard */}
        <div className="w-full lg:w-1/2 xl:w-5/12 h-[600px]">
          <LeaderboardTable />
        </div>

        {/* Right Side: Title & Play Button */}
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left space-y-8">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-400">
              Memory Arena
            </h1>
            <p className="text-xl md:text-3xl text-muted-foreground font-medium max-w-2xl">
              Test your reflexes. Remember the sequence. Dominate the leaderboard.
            </p>
          </div>

          <div className="pt-8 w-full max-w-md">
            <Button asChild size="lg" className="w-full h-20 text-2xl rounded-[2rem] font-black shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.6)] hover:scale-105 transition-all duration-300">
              <Link href="/login">
                START GAME <ArrowRight className="ml-4 h-8 w-8" />
              </Link>
            </Button>
          </div>
          
          <div className="flex gap-4 pt-4 opacity-70">
            <span className="text-sm font-medium border border-primary/20 bg-background/50 px-4 py-2 rounded-full backdrop-blur-md">
              Realtime Multiplayer
            </span>
            <span className="text-sm font-medium border border-primary/20 bg-background/50 px-4 py-2 rounded-full backdrop-blur-md hidden sm:inline-block">
              IoT Hardware Integration
            </span>
          </div>
        </div>

      </div>
    </main>
  );
}
