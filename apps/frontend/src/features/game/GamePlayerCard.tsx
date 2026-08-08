import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { COLOR_MAP } from '@/constants/game';
import type { PlayerState } from '@/hooks/useGameEngine';

interface GamePlayerCardProps {
  player: PlayerState | undefined;
  currentUserId: string | undefined;
  isPlayer1: boolean;
  showInputArea: boolean;
  effectiveSequenceLength: number;
  liveInputs: string[];
}

export function GamePlayerCard({
  player,
  currentUserId,
  isPlayer1,
  showInputArea,
  effectiveSequenceLength,
  liveInputs,
}: GamePlayerCardProps) {
  if (!player) return <div className="w-60 md:w-72" />;

  const isMe = player.id === currentUserId;
  const borderColorClass = isPlayer1
    ? (isMe ? "border-cyan-400 bg-cyan-50/40 ring-4 ring-cyan-300/30" : "border-cyan-200")
    : (isMe ? "border-orange-400 bg-orange-50/40 ring-4 ring-orange-300/30" : "border-orange-200");

  const avatarBorderClass = isPlayer1 ? "border-cyan-400" : "border-orange-400";
  const fallbackBgClass = isPlayer1 ? "bg-cyan-100 text-cyan-800" : "bg-orange-100 text-orange-800";
  const sideLabel = isPlayer1 ? "P1" : "P2";
  const labelBgClass = isPlayer1 ? "bg-cyan-100 text-cyan-800 border-cyan-300" : "bg-orange-100 text-orange-800 border-orange-300";

  return (
    <div className={cn(
      "w-60 md:w-72 relative overflow-hidden rounded-3xl border-3 bg-white/95 backdrop-blur-xl p-3 shadow-xl transition-all duration-300 text-slate-900",
      borderColorClass
    )}>
      <div className="flex items-center gap-3">
        <Avatar className={cn("h-12 w-12 md:h-14 md:w-14 border-3 shadow-md", avatarBorderClass)}>
          <AvatarImage src={player.pictureUrl || ''} />
          <AvatarFallback className={cn("font-black font-orbitron", fallbackBgClass)}>
            {player.displayName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <span className="font-orbitron font-black text-sm md:text-base text-slate-900 truncate">
              {player.displayName}
            </span>
            <span className={cn("text-[10px] font-black font-orbitron px-2 py-0.5 rounded-full border", labelBgClass)}>
              {sideLabel}
            </span>
          </div>
          <div className="flex justify-between items-end mt-0.5">
            <div className="flex items-center gap-1">
              <Trophy className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span className="text-xl md:text-2xl font-black text-purple-700 font-orbitron">{player.score}</span>
            </div>
            {showInputArea && (
              <div className="flex gap-1 bg-slate-100 p-1 rounded-full border border-slate-200">
                {Array.from({ length: effectiveSequenceLength }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={liveInputs[i] ? { scale: [1, 1.3, 1] } : {}}
                    className={cn(
                      "w-4 h-4 rounded-full border transition-all duration-200",
                      liveInputs[i] ? COLOR_MAP[liveInputs[i] as keyof typeof COLOR_MAP] : "border-slate-300 bg-white"
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
