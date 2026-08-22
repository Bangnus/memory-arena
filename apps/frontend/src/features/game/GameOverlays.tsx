import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
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
      {/* Standalone Centered Countdown Modal (Matching Theme: White Glassmorphism + Purple/Gold Accent) */}
      <AnimatePresence>
        {activeCountdown !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm pointer-events-none">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.15, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-64 h-64 md:w-72 md:h-72 rounded-[3rem] bg-white/95 border-4 border-purple-300/60 shadow-[0_0_60px_rgba(168,85,247,0.35)] backdrop-blur-2xl flex flex-col items-center justify-center p-4 relative"
            >
              {/* Header Badge */}
              <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 text-slate-950 font-black font-orbitron text-xs md:text-sm uppercase tracking-widest mb-1 shadow-sm border border-amber-300/60">
                <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                <span>{roundCountdown !== null ? 'NEXT ROUND IN' : 'GET READY!'}</span>
              </div>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCountdown}
                  initial={{ scale: 0.3, opacity: 0, y: 15 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 1.5, opacity: 0, y: -15 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  className="text-8xl md:text-9xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-br from-amber-400 via-orange-500 to-purple-600 drop-shadow-[0_4px_25px_rgba(251,191,36,0.5)]"
                >
                  {activeCountdown === 0 ? 'GO!' : activeCountdown}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Standalone Match Winner Modal */}
      <AnimatePresence>
        {matchWinner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4">
            <motion.div 
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md w-full bg-white/95 backdrop-blur-2xl rounded-[3rem] border-4 border-amber-400 shadow-[0_0_60px_rgba(251,191,36,0.4)] p-8 text-center text-slate-900 flex flex-col items-center"
            >
              <div className="w-20 h-20 bg-amber-400 text-amber-950 rounded-3xl flex items-center justify-center mb-3 shadow-xl border-4 border-amber-300 transform -rotate-3">
                <Trophy className="w-12 h-12 fill-amber-950" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black font-orbitron mb-1 tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-600">
                MATCH FINISHED
              </h2>
              <p className="text-xl font-bold font-inter mb-6 text-purple-900">
                {matchWinner === currentUserId 
                  ? '🎉 YOU WON THE MATCH! 🎉' 
                  : `${players.find((p, idx) => p.id === matchWinner || (idx + 1).toString() === matchWinner)?.displayName || 'Player'} WON!`}
              </p>
              <Button onClick={() => window.location.href = '/'} size="lg" className="h-14 px-8 text-lg font-orbitron font-black rounded-2xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 text-slate-950 shadow-lg hover:scale-105 cursor-pointer">
                RETURN TO HOME
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Standalone Round Result Toast-like overlay */}
      <AnimatePresence>
        {roundWinner && !matchWinner && (
          <div className="fixed top-24 left-0 right-0 z-40 flex justify-center pointer-events-none">
            <motion.div 
              initial={{ y: -30, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -30, opacity: 0, scale: 0.9 }}
              className="px-6 py-2.5 bg-white/95 backdrop-blur-xl text-slate-900 rounded-full shadow-2xl border-2 border-purple-300 flex items-center gap-2"
            >
              {roundWinner === currentUserId ? (
                <>
                  <CheckCircle2 className="text-emerald-500 w-6 h-6" />
                  <span className="text-lg font-black text-emerald-600 font-orbitron tracking-wide">ROUND WON!</span>
                </>
              ) : (
                <>
                  <XCircle className="text-rose-500 w-6 h-6" />
                  <span className="text-lg font-black text-rose-600 font-orbitron tracking-wide">ROUND LOST!</span>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
