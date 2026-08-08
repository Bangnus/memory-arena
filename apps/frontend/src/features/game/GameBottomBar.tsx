import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { COLOR_MAP } from '@/constants/game';

interface GameBottomBarProps {
  status: string;
  isSpectator: boolean;
  meReady: boolean;
  onReady: () => void;
  showInputArea: boolean;
  effectiveSequenceLength: number;
  p1LiveInputs: string[];
  p2LiveInputs: string[];
}

export function GameBottomBar({
  status,
  isSpectator,
  meReady,
  onReady,
  showInputArea,
  effectiveSequenceLength,
  p1LiveInputs,
  p2LiveInputs,
}: GameBottomBarProps) {
  return (
    <div className="h-16 flex items-center justify-center w-full z-10">
      {status === 'WAITING' && !isSpectator && (
        <Button 
          size="lg" 
          onClick={onReady}
          className={cn(
            "text-xl h-14 px-12 rounded-[1.5rem] font-black font-orbitron tracking-wider transition-all duration-300 shadow-xl border-4 border-white/20",
            meReady 
              ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/40"
              : "bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 text-slate-950 hover:scale-105 active:scale-95 shadow-cyan-400/40"
          )}
        >
          {meReady ? 'CANCEL READY' : 'READY TO PLAY!'}
        </Button>
      )}

      {showInputArea && (
        <div className="flex gap-4 bg-white/95 px-5 py-2 rounded-full border-3 border-purple-300/50 shadow-xl items-center">
          <div className="flex items-center gap-2 bg-cyan-50/80 px-3 py-1 rounded-xl border border-cyan-300">
            <span className="font-orbitron font-black text-[11px] text-cyan-700">P1:</span>
            <div className="flex gap-1.5">
              {Array.from({ length: effectiveSequenceLength }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={p1LiveInputs[i] ? { scale: [1, 1.3, 1] } : {}}
                  className={cn(
                    "w-6 h-6 rounded-full border-2 transition-all duration-200 shadow-sm",
                    p1LiveInputs[i] ? COLOR_MAP[p1LiveInputs[i] as keyof typeof COLOR_MAP] : "border-slate-300 bg-white"
                  )}
                />
              ))}
            </div>
          </div>

          <div className="w-px h-6 bg-purple-200" />

          <div className="flex items-center gap-2 bg-orange-50/80 px-3 py-1 rounded-xl border border-orange-300">
            <span className="font-orbitron font-black text-[11px] text-orange-700">P2:</span>
            <div className="flex gap-1.5">
              {Array.from({ length: effectiveSequenceLength }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={p2LiveInputs[i] ? { scale: [1, 1.3, 1] } : {}}
                  className={cn(
                    "w-6 h-6 rounded-full border-2 transition-all duration-200 shadow-sm",
                    p2LiveInputs[i] ? COLOR_MAP[p2LiveInputs[i] as keyof typeof COLOR_MAP] : "border-slate-300 bg-white"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
