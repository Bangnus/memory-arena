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
        "w-32 h-32 md:w-40 md:h-40 rounded-3xl transition-all duration-100 cursor-default",
        baseColorClass,
        isActive
          ? "opacity-100 shadow-2xl scale-110 ring-4 ring-white/60"
          : showInputArea && !isSpectator
            ? "opacity-70 shadow-lg cursor-pointer hover:opacity-90 active:opacity-100"
            : "opacity-30 shadow-sm",
      )}
    />
  );
}
