'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSocket } from './useSocket';
import { gameService } from '@/services/game.service';
import { DIFFICULTY_CONFIG } from '@/constants/game.config';
import { useGameSocketEvents } from './useGameSocketEvents';
import { useTimeSync } from './useTimeSync';

export interface PlayerState {
  id: string;
  displayName: string;
  pictureUrl: string | null;
  isReady: boolean;
  score: number;
}

export interface GameSession {
  id: string;
  status: string;
  difficulty: string;
  players?: PlayerState[];
  player1Id?: string | null;
  player2Id?: string | null;
  player1Score?: number;
  player2Score?: number;
  currentRound?: number;
  currentSequence?: string[] | null;
}

export function useGameEngine() {
  const { socket, isConnected } = useSocket();
  const { getSyncedTime, isSynced } = useTimeSync();
  const [session, setSession] = useState<GameSession | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [sequence, setSequence] = useState<string[]>([]);
  const [displaySpeedMs, setDisplaySpeedMs] = useState(0);
  const [isInputPhase, setIsInputPhase] = useState(false);
  const [roundWinner, setRoundWinner] = useState<string | null>(null);
  const [matchWinner, setMatchWinner] = useState<string | null>(null);
  const [sequenceStartAt, setSequenceStartAt] = useState<number | null>(null);
  const [sequenceId, setSequenceId] = useState(0);
  const [isSequenceDisplaying, setIsSequenceDisplaying] = useState(false);
  const [p1LiveInputs, setP1LiveInputs] = useState<string[]>([]);
  const [p2LiveInputs, setP2LiveInputs] = useState<string[]>([]);

  const effectiveDisplaySpeedMs = displaySpeedMs > 0
    ? displaySpeedMs
    : (session?.difficulty
        ? DIFFICULTY_CONFIG[session.difficulty as keyof typeof DIFFICULTY_CONFIG]?.displaySpeed ?? 800
        : 800);

  useEffect(() => {
    gameService.getCurrentSession().then((currentSession: any) => {
      if (currentSession) {
        console.log(`[DEBUG][GAME][${Date.now()}] initial session fetch: status=${currentSession.status}, round=${currentSession.currentRound}, startAt=${currentSession.startAt}`);
        setSession(currentSession);
        if (currentSession.currentSequence && Array.isArray(currentSession.currentSequence) && currentSession.currentSequence.length > 0) {
          setSequence(currentSession.currentSequence);
        }
        if (currentSession.startAt) {
          setSequenceStartAt(currentSession.startAt);
        }
        if (currentSession.status === 'COUNTDOWN' || currentSession.status === 'SHOW_SEQUENCE') {
          setIsSequenceDisplaying(true);
          setSequenceId(prev => prev === 0 ? 1 : prev);
        }
      }
    }).catch(() => {});
  }, [isConnected]);

  useGameSocketEvents({
    socket,
    getSyncedTime,
    setSession,
    setCountdown,
    setSequence,
    setDisplaySpeedMs,
    setIsInputPhase,
    setRoundWinner,
    setMatchWinner,
    setSequenceStartAt,
    setSequenceId,
    setIsSequenceDisplaying,
    setP1LiveInputs,
    setP2LiveInputs,
  });

  const toggleReady = useCallback(() => {
    if (socket && isConnected) socket.emit('player_ready');
  }, [socket, isConnected]);

  const submitSequence = useCallback((playerSequence: string[]) => {
    if (socket && isConnected && isInputPhase) {
      socket.emit('submit_sequence', { sequence: playerSequence });
      setIsInputPhase(false);
    }
  }, [socket, isConnected, isInputPhase]);

  return {
    isConnected,
    session,
    countdown,
    sequence,
    displaySpeedMs: effectiveDisplaySpeedMs,
    isInputPhase,
    isSequenceDisplaying,
    roundWinner,
    matchWinner,
    p1LiveInputs,
    p2LiveInputs,
    sequenceStartAt,
    sequenceId,
    toggleReady,
    submitSequence,
    getSyncedTime
  };
}
