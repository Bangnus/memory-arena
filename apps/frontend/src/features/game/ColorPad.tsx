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
        "w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-2xl md:rounded-3xl transition-all duration-100 cursor-default select-none border-2 border-white/40",
        baseColorClass,
        isActive
          ? "opacity-100 shadow-[0_0_50px_rgba(255,255,255,1)] scale-110 ring-4 ring-white z-20"
          : showInputArea && !isSpectator
            ? "opacity-80 shadow-md cursor-pointer hover:opacity-100 active:opacity-100"
            : "opacity-45 shadow-sm",
      )}
    />
  );
}
