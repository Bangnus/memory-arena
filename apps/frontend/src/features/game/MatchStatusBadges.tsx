import { Trophy } from 'lucide-react';

interface MatchStatusBadgesProps {
  difficulty: string;
  currentRound?: number;
  p1Score: number;
  p2Score: number;
}

export function MatchStatusBadges({
  difficulty,
  currentRound,
  p1Score,
  p2Score,
}: MatchStatusBadgesProps) {
  return (
    <div className="flex flex-col items-center gap-1 pt-1">
      <div className="px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-red-500 text-slate-950 font-black font-orbitron text-xs tracking-wider shadow-md border border-amber-300/50 flex items-center gap-1">
        <Trophy className="w-3.5 h-3.5 fill-slate-950" />
        <span>BEST OF 3</span>
      </div>
      <div className="flex gap-2">
        <div className="px-3 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white font-black font-orbitron text-[11px] border border-white/30">
          MODE: {difficulty || 'MEDIUM'}
        </div>
        <div className="px-3 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-cyan-300 font-black font-orbitron text-[11px] border border-cyan-400/30">
          ROUND {Math.min(3, currentRound || (p1Score + p2Score + 1))} / 3
        </div>
      </div>
    </div>
  );
}
