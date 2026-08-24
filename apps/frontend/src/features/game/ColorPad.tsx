import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { COLOR_MAP } from '@/constants/game';

interface ColorPadProps {
  color: string;
  activeColor: string | null;
  showInputArea: boolean;
  isSpectator: boolean;
  onClick: (color: string) => void;
}

/** Per-color glow when the pad is "lit up" during sequence display */
const ACTIVE_GLOW: Record<string, string> = {
  RED: 'shadow-[0_0_50px_rgba(239,68,68,0.9),0_0_100px_rgba(239,68,68,0.5)] ring-red-400',
  GREEN: 'shadow-[0_0_50px_rgba(16,185,129,0.9),0_0_100px_rgba(16,185,129,0.5)] ring-emerald-400',
  BLUE: 'shadow-[0_0_50px_rgba(59,130,246,0.9),0_0_100px_rgba(59,130,246,0.5)] ring-blue-400',
  YELLOW: 'shadow-[0_0_50px_rgba(245,158,11,0.9),0_0_100px_rgba(245,158,11,0.5)] ring-amber-300',
};

/** Brightened background when active */
const ACTIVE_BG: Record<string, string> = {
  RED: 'bg-red-400',
  GREEN: 'bg-emerald-400',
  BLUE: 'bg-blue-400',
  YELLOW: 'bg-amber-300',
};

export function ColorPad({
  color,
  activeColor,
  showInputArea,
  isSpectator,
  onClick,
}: ColorPadProps) {
  const baseColorClass = COLOR_MAP[color as keyof typeof COLOR_MAP];
  const isActive = activeColor === color;

  return (
    <motion.button
      whileHover={showInputArea ? { scale: 1.05 } : {}}
      whileTap={showInputArea ? { scale: 0.95 } : {}}
      onClick={() => onClick(color)}
      disabled={!showInputArea || isSpectator}
      className={cn(
        "w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-2xl md:rounded-3xl transition-all duration-100 cursor-default select-none border-2 border-white/40",
        isActive
          ? cn(ACTIVE_BG[color], ACTIVE_GLOW[color], "opacity-100 scale-110 ring-4 z-20 brightness-125")
          : cn(baseColorClass,
              showInputArea && !isSpectator
                ? "opacity-80 shadow-md cursor-pointer hover:opacity-100 active:opacity-100"
                : "opacity-45 shadow-sm",
            ),
      )}
    />
  );
}
