import { useState, useEffect, useRef } from 'react';
import { useSound } from '@/hooks/useSound';
import type { GameSession } from '@/hooks/useGameEngine';

interface UseGameScreenStateProps {
  session: GameSession | null; countdown: number | null; sequence: string[]; displaySpeedMs: number;
  isInputPhase: boolean; roundWinner: string | null; matchWinner: string | null;
  currentUserId: string | undefined; onSubmitSequence: (seq: string[]) => void;
  sequenceStartAt?: number | null; sequenceId?: number; p1LiveInputs: string[]; p2LiveInputs: string[];
}

export function useGameScreenState({
  session, countdown, sequence, displaySpeedMs, isInputPhase, roundWinner, matchWinner,
  currentUserId, onSubmitSequence, sequenceStartAt, sequenceId = 0, p1LiveInputs, p2LiveInputs,
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
    const startDelay = sequenceStartAt - Date.now();
    let mainTimer: NodeJS.Timeout;
    let nextTimer: NodeJS.Timeout;
    let offTimer: NodeJS.Timeout;

    mainTimer = setTimeout(() => {
      if (gen !== seqAnimRef.current) return;
      let i = 0;
      const showNext = () => {
        if (gen !== seqAnimRef.current || i >= sequence.length) {
          setActiveColor(null);
          return;
        }
        setActiveColor(sequence[i]);
        offTimer = setTimeout(() => {
          if (gen === seqAnimRef.current) setActiveColor(null);
        }, displaySpeedMs * 0.65);
        i++;
        nextTimer = setTimeout(showNext, displaySpeedMs);
      };
      showNext();
    }, Math.max(0, startDelay));

    return () => {
      clearTimeout(mainTimer);
      clearTimeout(nextTimer);
      clearTimeout(offTimer);
      seqAnimRef.current++;
      setActiveColor(null);
    };
  }, [sequenceId, sequence, sequenceStartAt, isInputPhase, displaySpeedMs]);

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
