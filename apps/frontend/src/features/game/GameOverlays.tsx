import { AnimatePresence } from 'framer-motion';
import { CountdownOverlay } from './overlays/CountdownOverlay';
import { MatchWinnerOverlay } from './overlays/MatchWinnerOverlay';
import { RoundResultOverlay } from './overlays/RoundResultOverlay';
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
  return (
    <AnimatePresence>
      <CountdownOverlay
        activeCountdown={activeCountdown}
        roundCountdown={roundCountdown}
        players={players}
        roundWinner={roundWinner}
      />
      <MatchWinnerOverlay
        matchWinner={matchWinner}
        currentUserId={currentUserId}
        players={players}
      />
      <RoundResultOverlay
        roundWinner={roundWinner}
        matchWinner={matchWinner}
        currentUserId={currentUserId}
      />
    </AnimatePresence>
  );
}
