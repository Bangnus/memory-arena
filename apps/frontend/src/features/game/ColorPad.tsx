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
        "w-32 h-32 md:w-40 md:h-40 rounded-3xl transition-all duration-75 cursor-default select-none",
        baseColorClass,
        isActive
          ? "opacity-100 shadow-[0_0_50px_rgba(255,255,255,0.9)] scale-105 ring-4 ring-white z-20"
          : showInputArea && !isSpectator
            ? "opacity-70 shadow-lg cursor-pointer hover:opacity-90 active:opacity-100"
            : "opacity-40 shadow-sm",
      )}
    />
  );
}
