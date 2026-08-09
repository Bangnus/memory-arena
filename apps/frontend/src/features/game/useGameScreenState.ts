import { useState, useEffect, useRef } from 'react';
import { useSound } from '@/hooks/useSound';
import type { GameSession } from '@/hooks/useGameEngine';

interface UseGameScreenStateProps {
  session: GameSession | null; countdown: number | null; sequence: string[]; displaySpeedMs: number;
  isInputPhase: boolean; roundWinner: string | null; matchWinner: string | null;
  currentUserId: string | undefined; onSubmitSequence: (seq: string[]) => void;
  sequenceStartAt?: number | null; sequenceId?: number; p1LiveInputs: string[]; p2LiveInputs: string[];
  getSyncedTime: () => number;
}

export function useGameScreenState({
  session, countdown, sequence, displaySpeedMs, isInputPhase, roundWinner, matchWinner,
  currentUserId, onSubmitSequence, sequenceStartAt, sequenceId = 0, p1LiveInputs, p2LiveInputs,
  getSyncedTime,
}: UseGameScreenStateProps) {
  const [playerInput, setPlayerInput] = useState<string[]>([]);
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [roundCountdown, setRoundCountdown] = useState<number | null>(null);
  const [lastClickTime, setLastClickTime] = useState(0);
  const seqAnimRef = useRef(0);
  const { playButtonPress, playCorrect, playWrong } = useSound();

  const players = session?.players ?? [];
  const me = players.find(p => p.id === currentUserId);
  const isSpectator = !me;
  const effectiveSequence = sequence.length > 0 ? sequence : (session?.currentSequence || []);
  const showInputArea = isInputPhase || p1LiveInputs.length > 0 || p2LiveInputs.length > 0;

  useEffect(() => {
    if (roundWinner && !matchWinner) {
      if (roundWinner === currentUserId) playCorrect(); else playWrong();
      const timer = setTimeout(() => setRoundCountdown(3), 1800);
      return () => clearTimeout(timer);
    }
  }, [roundWinner, matchWinner, currentUserId, playCorrect, playWrong]);

  useEffect(() => {
    if (roundCountdown === null) return;
    if (roundCountdown > 0) {
      const timer = setTimeout(() => setRoundCountdown(roundCountdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setRoundCountdown(null);
    }
  }, [roundCountdown]);

  useEffect(() => {
    if (sequence.length === 0 || !sequenceStartAt || isInputPhase) {
      setActiveColor(null);
      return;
    }
    const gen = ++seqAnimRef.current;
    
    let rafId: number;
    let localActiveColor: string | null = null;
    
    const loop = () => {
      if (gen !== seqAnimRef.current) return;
      
      const now = getSyncedTime();
      if (now < sequenceStartAt) {
        rafId = requestAnimationFrame(loop);
        return;
      }
      
      const elapsed = now - sequenceStartAt;
      const stepIndex = Math.floor(elapsed / displaySpeedMs);
      
      if (stepIndex >= sequence.length) {
        if (localActiveColor !== null) {
          localActiveColor = null;
          setActiveColor(null);
        }
        return; // done
      }
      
      // Active for 65% of the step duration
      const stepElapsed = elapsed % displaySpeedMs;
      if (stepElapsed < displaySpeedMs * 0.65) {
        if (localActiveColor !== sequence[stepIndex]) {
          localActiveColor = sequence[stepIndex];
          setActiveColor(sequence[stepIndex]);
          console.log(`[DEBUG][FRONTEND][${Date.now()}] RAF Active color flash: ${sequence[stepIndex]} at step ${stepIndex + 1}/${sequence.length}`);
        }
      } else {
        if (localActiveColor !== null) {
          localActiveColor = null;
          setActiveColor(null);
        }
      }
      
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      seqAnimRef.current++;
      setActiveColor(null);
    };
  }, [sequenceId, sequence, sequenceStartAt, isInputPhase, displaySpeedMs, getSyncedTime]);

  useEffect(() => {
    if (isInputPhase) {
      setActiveColor(null);
      setPlayerInput([]);
    }
  }, [isInputPhase]);

  const handleColorClick = (color: string) => {
    if (!showInputArea || isSpectator) return;
    const now = Date.now();
    if (now - lastClickTime < 200) return;
    setLastClickTime(now);
    playButtonPress();
    const newInput = [...playerInput, color];
    setPlayerInput(newInput);
    if (newInput.length === effectiveSequence.length) onSubmitSequence(newInput);
  };

  return {
    playerInput, activeColor, roundCountdown, me, isSpectator,
    effectiveSequence, showInputArea, handleColorClick, activeCountdown: roundCountdown ?? countdown,
  };
}
