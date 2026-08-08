import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PlayerState } from '@/hooks/useGameEngine';

interface GameOverlaysProps {
  activeCountdown: number | null;
  roundCountdown: number | null;
  matchWinner: string | null;
  currentUserId: string | undefined;
  players: PlayerState[];
  roundWinner: string | null;
}

export function GameOverlays({
  activeCountdown,
  roundCountdown,
  matchWinner,
  currentUserId,
  players,
  roundWinner,
}: GameOverlaysProps) {
  return (
    <>
      {/* Countdown Overlay (Start & Next Round) */}
      <AnimatePresence>
        {activeCountdown !== null && (
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-md rounded-[3rem]"
          >
            <div className="text-lg font-black font-orbitron text-amber-300 uppercase tracking-widest mb-1">
              {roundCountdown !== null ? 'NEXT ROUND STARTING...' : 'GET READY!'}
            </div>
            <span className="text-8xl font-black font-orbitron text-amber-400 drop-shadow-[0_4px_20px_rgba(251,191,36,0.6)] animate-pulse">
              {activeCountdown === 0 ? 'GO!' : activeCountdown}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Match Winner Overlay */}
      <AnimatePresence>
        {matchWinner && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-xl rounded-[3rem] border-4 border-amber-400 shadow-2xl p-6 text-center text-slate-900"
          >
            <div className="w-20 h-20 bg-amber-400 text-amber-950 rounded-3xl flex items-center justify-center mb-3 shadow-xl border-4 border-amber-300 transform -rotate-3">
              <Trophy className="w-12 h-12 fill-amber-950" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black font-orbitron mb-1 tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-600">
              MATCH FINISHED
            </h2>
            <p className="text-xl font-bold font-inter mb-5 text-purple-900">
              {matchWinner === currentUserId 
                ? '🎉 YOU WON THE MATCH! 🎉' 
                : `${players.find((p, idx) => p.id === matchWinner || (idx + 1).toString() === matchWinner)?.displayName || 'Player'} WON!`}
            </p>
            <Button onClick={() => window.location.href = '/'} size="lg" className="h-14 px-8 text-lg font-orbitron font-black rounded-2xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 text-slate-950 shadow-lg hover:scale-105">
              RETURN TO HOME
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Round Result Toast-like overlay */}
      <AnimatePresence>
        {roundWinner && !matchWinner && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="absolute top-2 z-40 px-6 py-2 bg-white text-slate-900 rounded-full shadow-xl border-3 border-purple-300 flex items-center gap-2"
          >
            {roundWinner === currentUserId ? (
              <><CheckCircle2 className="text-emerald-500 w-6 h-6" /><span className="text-lg font-black text-emerald-600 font-orbitron tracking-wide">ROUND WON!</span></>
            ) : (
              <><XCircle className="text-rose-500 w-6 h-6" /><span className="text-lg font-black text-rose-600 font-orbitron tracking-wide">ROUND LOST!</span></>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
