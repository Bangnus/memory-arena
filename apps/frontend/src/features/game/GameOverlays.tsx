import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, CheckCircle2, XCircle, Sparkles, Crown } from 'lucide-react';
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
  const p1 = players[0];
  const p2 = players[1];

  const p1WonLastRound = roundWinner === p1?.id || roundWinner === '1';
  const p2WonLastRound = roundWinner === p2?.id || roundWinner === '2';

  return (
    <>
      {/* Centered Countdown Overlay with Live Scores on Left & Right */}
      <AnimatePresence>
        {activeCountdown !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 backdrop-blur-md p-4 pointer-events-none">
            <motion.div 
              initial={{ scale: 0.85, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 1.05, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="max-w-xl w-full bg-white/95 backdrop-blur-2xl rounded-[2.5rem] border-2 border-slate-200/90 shadow-2xl p-6 md:p-8 flex flex-col items-center relative text-slate-900"
            >
              {/* Header Title Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-black font-orbitron text-xs md:text-sm uppercase tracking-wider mb-5 shadow-sm">
                <Sparkles className="w-4 h-4 text-amber-600 fill-amber-500" />
                <span>{roundCountdown !== null ? 'NEXT ROUND STARTING' : 'GET READY FOR BATTLE'}</span>
              </div>

              {/* 3-Column Arena Score Board: [ P1 Score ] [ Countdown ] [ P2 Score ] */}
              <div className="w-full grid grid-cols-3 items-center gap-3 md:gap-6">
                
                {/* Left: Player 1 Score & Status */}
                <div className={`flex flex-col items-center p-3.5 md:p-4 rounded-3xl transition-all ${p1WonLastRound ? 'bg-amber-50 border-2 border-amber-300 shadow-md' : 'bg-slate-50 border border-slate-200/80'}`}>
                  <div className="relative mb-2">
                    <img 
                      src={p1?.pictureUrl || '/avatars/default.png'} 
                      alt={p1?.displayName || 'P1'} 
                      className="w-12 h-12 md:w-14 md:h-14 rounded-2xl object-cover border-2 border-white shadow"
                    />
                    {p1WonLastRound && (
                      <div className="absolute -top-2.5 -right-2.5 bg-amber-400 text-amber-950 p-1 rounded-full shadow">
                        <Crown className="w-3.5 h-3.5 fill-amber-950" />
                      </div>
                    )}
                  </div>

                  <div className="text-xs md:text-sm font-bold text-slate-800 truncate max-w-[100px] text-center mb-1">
                    {p1?.displayName || 'Player 1'}
                  </div>

                  <div className="text-3xl md:text-4xl font-black font-orbitron text-slate-900 flex items-center justify-center">
                    {p1?.score ?? 0}
                  </div>

                  {p1WonLastRound && (
                    <span className="text-[10px] font-black font-orbitron text-amber-700 uppercase mt-1">ROUND WIN</span>
                  )}
                </div>

                {/* Center: Giant Countdown Timer */}
                <div className="flex flex-col items-center justify-center py-2">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeCountdown}
                      initial={{ scale: 0.4, opacity: 0, y: 10 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 1.4, opacity: 0, y: -10 }}
                      transition={{ type: "spring", stiffness: 450, damping: 25 }}
                      className="text-7xl md:text-8xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-b from-slate-900 via-slate-800 to-indigo-900 tracking-tight"
                    >
                      {activeCountdown === 0 ? 'GO!' : activeCountdown}
                    </motion.div>
                  </AnimatePresence>
                  <span className="text-[11px] font-bold font-orbitron text-slate-400 uppercase tracking-widest mt-1">SECONDS</span>
                </div>

                {/* Right: Player 2 Score & Status */}
                <div className={`flex flex-col items-center p-3.5 md:p-4 rounded-3xl transition-all ${p2WonLastRound ? 'bg-amber-50 border-2 border-amber-300 shadow-md' : 'bg-slate-50 border border-slate-200/80'}`}>
                  <div className="relative mb-2">
                    <img 
                      src={p2?.pictureUrl || '/avatars/default.png'} 
                      alt={p2?.displayName || 'P2'} 
                      className="w-12 h-12 md:w-14 md:h-14 rounded-2xl object-cover border-2 border-white shadow"
                    />
                    {p2WonLastRound && (
                      <div className="absolute -top-2.5 -right-2.5 bg-amber-400 text-amber-950 p-1 rounded-full shadow">
                        <Crown className="w-3.5 h-3.5 fill-amber-950" />
                      </div>
                    )}
                  </div>

                  <div className="text-xs md:text-sm font-bold text-slate-800 truncate max-w-[100px] text-center mb-1">
                    {p2?.displayName || 'Player 2'}
                  </div>

                  <div className="text-3xl md:text-4xl font-black font-orbitron text-slate-900 flex items-center justify-center">
                    {p2?.score ?? 0}
                  </div>

                  {p2WonLastRound && (
                    <span className="text-[10px] font-black font-orbitron text-amber-700 uppercase mt-1">ROUND WIN</span>
                  )}
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Standalone Match Winner Modal (Clean modern card style) */}
      <AnimatePresence>
        {matchWinner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4">
            <motion.div 
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md w-full bg-white/95 backdrop-blur-2xl rounded-[3rem] border-2 border-slate-200 shadow-2xl p-8 text-center text-slate-900 flex flex-col items-center"
            >
              <div className="w-20 h-20 bg-amber-400 text-amber-950 rounded-3xl flex items-center justify-center mb-3 shadow-lg border-2 border-amber-300 transform -rotate-3">
                <Trophy className="w-11 h-11 fill-amber-950" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black font-orbitron mb-1 tracking-wide text-slate-900">
                MATCH FINISHED
              </h2>
              <p className="text-xl font-bold font-inter mb-6 text-purple-900">
                {matchWinner === currentUserId 
                  ? '🎉 YOU WON THE MATCH! 🎉' 
                  : `${players.find((p, idx) => p.id === matchWinner || (idx + 1).toString() === matchWinner)?.displayName || 'Player'} WON!`}
              </p>
              <Button onClick={() => window.location.href = '/'} size="lg" className="h-14 px-8 text-lg font-orbitron font-black rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-lg hover:scale-105 cursor-pointer">
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
              className="px-6 py-2.5 bg-white text-slate-900 rounded-full shadow-xl border border-slate-200 flex items-center gap-2"
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
