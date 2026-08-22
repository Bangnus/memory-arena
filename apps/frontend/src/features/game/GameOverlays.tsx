import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, CheckCircle2, XCircle, Sparkles, Crown, Zap, Swords } from 'lucide-react';
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
      {/* Dynamic Colorful Arena Countdown Overlay */}
      <AnimatePresence>
        {activeCountdown !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 pointer-events-none">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 1.08, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="max-w-xl w-full bg-gradient-to-b from-slate-900/95 via-indigo-950/95 to-slate-900/95 backdrop-blur-2xl rounded-[2.5rem] border-2 border-indigo-500/40 shadow-[0_0_60px_rgba(79,70,229,0.35)] p-6 md:p-8 flex flex-col items-center relative text-white overflow-hidden"
            >
              {/* Top Accent Light Bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 via-amber-400 to-rose-500" />

              {/* Header Title Badge */}
              <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 text-slate-950 font-black font-orbitron text-xs md:text-sm uppercase tracking-wider mb-6 shadow-lg">
                <Swords className="w-4 h-4 fill-slate-950" />
                <span>{roundCountdown !== null ? 'NEXT ROUND STARTING' : 'READY FOR BATTLE!'}</span>
              </div>

              {/* 3-Column VS Arena: [ P1 Blue Theme ] [ VS Countdown ] [ P2 Rose Theme ] */}
              <div className="w-full grid grid-cols-3 items-center gap-3 md:gap-6">
                
                {/* Left: Player 1 (Electric Cyan Theme) */}
                <div className={`flex flex-col items-center p-3.5 md:p-4 rounded-3xl transition-all relative ${
                  p1WonLastRound 
                    ? 'bg-gradient-to-b from-cyan-500/25 to-blue-600/30 border-2 border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.3)]' 
                    : 'bg-white/5 border border-cyan-500/20'
                }`}>
                  <div className="relative mb-2">
                    <img 
                      src={p1?.pictureUrl || '/avatars/default.png'} 
                      alt={p1?.displayName || 'P1'} 
                      className="w-13 h-13 md:w-16 md:h-16 rounded-2xl object-cover border-2 border-cyan-300 shadow-md"
                    />
                    {p1WonLastRound && (
                      <div className="absolute -top-3 -right-2.5 bg-amber-400 text-amber-950 p-1 rounded-full shadow-lg border border-white animate-bounce">
                        <Crown className="w-4 h-4 fill-amber-950" />
                      </div>
                    )}
                  </div>

                  <span className="text-[11px] font-black font-orbitron text-cyan-300 uppercase tracking-wider mb-0.5">P1</span>
                  <div className="text-xs md:text-sm font-bold text-white truncate max-w-[105px] text-center mb-2">
                    {p1?.displayName || 'Player 1'}
                  </div>

                  {/* Big Score Box */}
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center shadow-inner">
                    <span className="text-3xl md:text-4xl font-black font-orbitron text-cyan-200">
                      {p1?.score ?? 0}
                    </span>
                  </div>

                  {p1WonLastRound && (
                    <span className="text-[10px] font-black font-orbitron text-amber-300 uppercase tracking-widest mt-2 bg-amber-400/20 px-2.5 py-0.5 rounded-full border border-amber-400/40">
                      ROUND WIN
                    </span>
                  )}
                </div>

                {/* Center: Giant Animated Countdown & VS Badge */}
                <div className="flex flex-col items-center justify-center py-2">
                  <div className="text-[11px] font-black font-orbitron text-indigo-300/80 tracking-widest mb-1">
                    VS
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeCountdown}
                      initial={{ scale: 0.3, opacity: 0, y: 15 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 1.4, opacity: 0, y: -15 }}
                      transition={{ type: "spring", stiffness: 450, damping: 25 }}
                      className="text-7xl md:text-8xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-amber-400 to-orange-500 drop-shadow-[0_4px_25px_rgba(251,191,36,0.6)]"
                    >
                      {activeCountdown === 0 ? 'GO!' : activeCountdown}
                    </motion.div>
                  </AnimatePresence>
                  <span className="text-[10px] font-bold font-orbitron text-slate-400 uppercase tracking-widest mt-1">SECONDS</span>
                </div>

                {/* Right: Player 2 (Neon Rose / Coral Theme) */}
                <div className={`flex flex-col items-center p-3.5 md:p-4 rounded-3xl transition-all relative ${
                  p2WonLastRound 
                    ? 'bg-gradient-to-b from-rose-500/25 to-orange-600/30 border-2 border-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.3)]' 
                    : 'bg-white/5 border border-rose-500/20'
                }`}>
                  <div className="relative mb-2">
                    <img 
                      src={p2?.pictureUrl || '/avatars/default.png'} 
                      alt={p2?.displayName || 'P2'} 
                      className="w-13 h-13 md:w-16 md:h-16 rounded-2xl object-cover border-2 border-rose-300 shadow-md"
                    />
                    {p2WonLastRound && (
                      <div className="absolute -top-3 -right-2.5 bg-amber-400 text-amber-950 p-1 rounded-full shadow-lg border border-white animate-bounce">
                        <Crown className="w-4 h-4 fill-amber-950" />
                      </div>
                    )}
                  </div>

                  <span className="text-[11px] font-black font-orbitron text-rose-300 uppercase tracking-wider mb-0.5">P2</span>
                  <div className="text-xs md:text-sm font-bold text-white truncate max-w-[105px] text-center mb-2">
                    {p2?.displayName || 'Player 2'}
                  </div>

                  {/* Big Score Box */}
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-rose-500/20 border-2 border-rose-400 flex items-center justify-center shadow-inner">
                    <span className="text-3xl md:text-4xl font-black font-orbitron text-rose-200">
                      {p2?.score ?? 0}
                    </span>
                  </div>

                  {p2WonLastRound && (
                    <span className="text-[10px] font-black font-orbitron text-amber-300 uppercase tracking-widest mt-2 bg-amber-400/20 px-2.5 py-0.5 rounded-full border border-amber-400/40">
                      ROUND WIN
                    </span>
                  )}
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Match Winner Modal (Colorful Celebration Style) */}
      <AnimatePresence>
        {matchWinner && (
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
        )}
      </AnimatePresence>

      {/* Round Result Toast-like overlay */}
      <AnimatePresence>
        {roundWinner && !matchWinner && (
          <div className="fixed top-24 left-0 right-0 z-40 flex justify-center pointer-events-none">
            <motion.div 
              initial={{ y: -30, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -30, opacity: 0, scale: 0.9 }}
              className={`px-6 py-2.5 rounded-full shadow-2xl border-2 flex items-center gap-2.5 backdrop-blur-xl ${
                roundWinner === currentUserId 
                  ? 'bg-slate-900/90 text-emerald-300 border-emerald-400 shadow-emerald-500/20' 
                  : 'bg-slate-900/90 text-rose-300 border-rose-400 shadow-rose-500/20'
              }`}
            >
              {roundWinner === currentUserId ? (
                <>
                  <CheckCircle2 className="text-emerald-400 w-6 h-6" />
                  <span className="text-base md:text-lg font-black text-emerald-300 font-orbitron tracking-wide">ROUND WON!</span>
                </>
              ) : (
                <>
                  <XCircle className="text-rose-400 w-6 h-6" />
                  <span className="text-base md:text-lg font-black text-rose-300 font-orbitron tracking-wide">ROUND LOST!</span>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
