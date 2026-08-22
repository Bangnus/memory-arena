import { motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';

interface RoundResultOverlayProps {
  roundWinner: string | null;
  matchWinner: string | null;
  currentUserId: string | undefined;
}

export function RoundResultOverlay({
  roundWinner,
  matchWinner,
  currentUserId,
}: RoundResultOverlayProps) {
  if (!roundWinner || matchWinner) return null;

  const isUserWinner = roundWinner === currentUserId;

  return (
    <div className="fixed top-24 left-0 right-0 z-40 flex justify-center pointer-events-none">
      <motion.div 
        initial={{ y: -30, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -30, opacity: 0, scale: 0.9 }}
        className={`px-6 py-2.5 rounded-full shadow-2xl border-2 flex items-center gap-2.5 backdrop-blur-xl ${
          isUserWinner 
            ? 'bg-slate-900/90 text-emerald-300 border-emerald-400 shadow-emerald-500/20' 
            : 'bg-slate-900/90 text-rose-300 border-rose-400 shadow-rose-500/20'
        }`}
      >
        {isUserWinner ? (
          <>
            <CheckCircle2 className="text-emerald-400 w-6 h-6" />
            <span className="text-base md:text-lg font-black text-emerald-300 font-orbitron tracking-wide">
              ROUND WON!
            </span>
          </>
        ) : (
          <>
            <XCircle className="text-rose-400 w-6 h-6" />
            <span className="text-base md:text-lg font-black text-rose-300 font-orbitron tracking-wide">
              ROUND LOST!
            </span>
          </>
        )}
      </motion.div>
    </div>
  );
}
