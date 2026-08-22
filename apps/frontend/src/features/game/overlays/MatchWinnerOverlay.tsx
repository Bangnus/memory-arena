import { motion } from 'framer-motion';
import { Trophy, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PlayerState } from '@/hooks/useGameEngine';

interface MatchWinnerOverlayProps {
  matchWinner: string | null;
  currentUserId: string | undefined;
  players: PlayerState[];
}

export function MatchWinnerOverlay({
  matchWinner,
  currentUserId,
  players,
}: MatchWinnerOverlayProps) {
  if (!matchWinner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-lg p-4">
      <motion.div 
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="max-w-md w-full bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 rounded-[3rem] border-4 border-amber-400 shadow-[0_0_80px_rgba(251,191,36,0.4)] p-8 text-center text-white flex flex-col items-center relative overflow-hidden"
      >
        <div className="w-22 h-22 bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500 text-slate-950 rounded-3xl flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(251,191,36,0.5)] border-2 border-white transform -rotate-3">
          <Trophy className="w-12 h-12 fill-slate-950" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-300 font-orbitron font-black text-xs uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5 fill-amber-300" />
          <span>CHAMPION VICTORY</span>
        </div>

        <h2 className="text-3xl md:text-4xl font-black font-orbitron mb-2 tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-400">
          MATCH FINISHED
        </h2>

        <p className="text-xl md:text-2xl font-bold font-inter mb-6 text-sky-200">
          {matchWinner === currentUserId 
            ? '🎉 YOU WON THE MATCH! 🎉' 
            : `🏆 ${players.find((p, idx) => p.id === matchWinner || (idx + 1).toString() === matchWinner)?.displayName || 'Player'} WON!`}
        </p>

        <Button 
          onClick={() => window.location.href = '/'} 
          size="lg" 
          className="w-full h-14 px-8 text-lg font-orbitron font-black rounded-2xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 hover:from-emerald-300 hover:to-blue-400 text-slate-950 shadow-[0_0_40px_rgba(52,211,153,0.5)] hover:scale-105 transition-all cursor-pointer border-2 border-white/40"
        >
          RETURN TO HOME
        </Button>
      </motion.div>
    </div>
  );
}
