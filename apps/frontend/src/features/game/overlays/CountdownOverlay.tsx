import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Swords } from 'lucide-react';
import type { PlayerState } from '@/hooks/useGameEngine';

interface CountdownOverlayProps {
  activeCountdown: number | null;
  roundCountdown: number | null;
  players: PlayerState[];
  roundWinner: string | null;
}

export function CountdownOverlay({
  activeCountdown,
  roundCountdown,
  players,
  roundWinner,
}: CountdownOverlayProps) {
  if (activeCountdown === null) return null;

  const p1 = players[0];
  const p2 = players[1];
  const p1WonLastRound = roundWinner === p1?.id || roundWinner === '1';
  const p2WonLastRound = roundWinner === p2?.id || roundWinner === '2';

  return (
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

        {/* 3-Column VS Arena: [ P1 Blue ] [ VS Countdown ] [ P2 Rose ] */}
        <div className="w-full grid grid-cols-3 items-center gap-3 md:gap-6">
          {/* Player 1 */}
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
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center shadow-inner">
              <span className="text-3xl md:text-4xl font-black font-orbitron text-cyan-200">{p1?.score ?? 0}</span>
            </div>
            {p1WonLastRound && (
              <span className="text-[10px] font-black font-orbitron text-amber-300 uppercase tracking-widest mt-2 bg-amber-400/20 px-2.5 py-0.5 rounded-full border border-amber-400/40">
                ROUND WIN
              </span>
            )}
          </div>

          {/* Center Giant Countdown */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="text-[11px] font-black font-orbitron text-indigo-300/80 tracking-widest mb-1">VS</div>
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

          {/* Player 2 */}
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
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-rose-500/20 border-2 border-rose-400 flex items-center justify-center shadow-inner">
              <span className="text-3xl md:text-4xl font-black font-orbitron text-rose-200">{p2?.score ?? 0}</span>
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
  );
}
