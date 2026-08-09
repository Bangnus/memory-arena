'use client';

import { useGameScreenState } from './useGameScreenState';
import { GamePlayerCard } from './GamePlayerCard';
import { MatchStatusBadges } from './MatchStatusBadges';
import { GameArena } from './GameArena';
import { GameBottomBar } from './GameBottomBar';
import type { GameSession } from '@/hooks/useGameEngine';

interface GameScreenProps {
  session: GameSession | null; countdown: number | null; sequence: string[]; displaySpeedMs?: number;
  isInputPhase: boolean; isSequenceDisplaying: boolean; roundWinner: string | null; matchWinner: string | null;
  p1LiveInputs?: string[]; p2LiveInputs?: string[]; currentUserId: string | undefined;
  onReady: () => void; onSubmitSequence: (seq: string[]) => void; sequenceStartAt?: number | null; sequenceId?: number;
  getSyncedTime: () => number;
}

export function GameScreen({
  session, countdown, sequence, displaySpeedMs = 800, isInputPhase, isSequenceDisplaying,
  roundWinner, matchWinner, p1LiveInputs = [], p2LiveInputs = [], currentUserId,
  onReady, onSubmitSequence, sequenceStartAt, sequenceId = 0, getSyncedTime,
}: GameScreenProps) {
  const {
    activeColor, roundCountdown, me, isSpectator, effectiveSequence,
    showInputArea, handleColorClick, activeCountdown,
  } = useGameScreenState({
    session, countdown, sequence, displaySpeedMs, isInputPhase,
    roundWinner, matchWinner, currentUserId, onSubmitSequence,
    sequenceStartAt, sequenceId, p1LiveInputs, p2LiveInputs,
    getSyncedTime,
  });

  if (!session || !session.players) {
    return <div className="text-center p-8 text-white font-orbitron">Waiting for session data...</div>;
  }

  const players = session.players;

  return (
    <div className="w-full h-full flex flex-col justify-between items-center relative overflow-hidden py-1 px-4 select-none">
      <div className="w-full max-w-6xl flex items-start justify-between gap-4 z-10">
        <GamePlayerCard
          player={players[0]} currentUserId={currentUserId} isPlayer1={true}
          showInputArea={showInputArea} effectiveSequenceLength={effectiveSequence.length} liveInputs={p1LiveInputs}
        />
        <MatchStatusBadges
          difficulty={session.difficulty} currentRound={session.currentRound}
          p1Score={players[0]?.score || 0} p2Score={players[1]?.score || 0}
        />
        <GamePlayerCard
          player={players[1]} currentUserId={currentUserId} isPlayer1={false}
          showInputArea={showInputArea} effectiveSequenceLength={effectiveSequence.length} liveInputs={p2LiveInputs}
        />
      </div>

      <GameArena
        isSequenceDisplaying={isSequenceDisplaying} isInputPhase={isInputPhase} activeColor={activeColor}
        activeCountdown={activeCountdown} roundCountdown={roundCountdown} matchWinner={matchWinner}
        currentUserId={currentUserId} players={players} roundWinner={roundWinner}
        showInputArea={showInputArea} isSpectator={isSpectator} handleColorClick={handleColorClick}
      />

      <GameBottomBar
        status={session.status} isSpectator={isSpectator} meReady={!!me?.isReady} onReady={onReady}
        showInputArea={showInputArea} effectiveSequenceLength={effectiveSequence.length}
        p1LiveInputs={p1LiveInputs} p2LiveInputs={p2LiveInputs}
      />
    </div>
  );
}
