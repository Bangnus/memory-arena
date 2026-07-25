'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSocket } from './useSocket';
import { gameService } from '@/services/game.service';
import { GAME_STATUS, COLOR } from '@/constants/game';
import { SOCKET_EVENTS } from '@/constants/socket';

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
}

export function useGameEngine() {
  const { socket, isConnected } = useSocket();
  const [session, setSession] = useState<GameSession | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [sequence, setSequence] = useState<string[]>([]);
  const [displaySpeedMs, setDisplaySpeedMs] = useState(1000);
  const [isInputPhase, setIsInputPhase] = useState(false);
  const [roundWinner, setRoundWinner] = useState<string | null>(null);
  const [matchWinner, setMatchWinner] = useState<string | null>(null);



  // Always fetch current session on mount and when connection status changes
  useEffect(() => {
    gameService.getCurrentSession().then((currentSession) => {
      if (currentSession) setSession(currentSession);
    }).catch(() => {});
  }, [isConnected]);

  useEffect(() => {
    if (!socket) return;

    socket.on(SOCKET_EVENTS.SESSION_UPDATE, (updatedSession: GameSession) => {
      setSession(updatedSession);
    });

    socket.on(SOCKET_EVENTS.COUNTDOWN_START, (data: { count: number }) => {
      setCountdown(data.count);
    });

    socket.on(SOCKET_EVENTS.SEQUENCE_SHOW, (data: { sequence: string[]; displaySpeedMs: number }) => {
      setSequence(data.sequence);
      setDisplaySpeedMs(data.displaySpeedMs);
      setIsInputPhase(false);
      setRoundWinner(null);
    });

    socket.on(SOCKET_EVENTS.INPUT_ENABLED, () => {
      setIsInputPhase(true);
    });

    socket.on(SOCKET_EVENTS.ROUND_RESULT, (data: { winnerId: string; players: PlayerState[] }) => {
      setRoundWinner(data.winnerId);
      setIsInputPhase(false);
      setSession(prev => prev ? { ...prev, players: data.players } : null);
    });

    socket.on(SOCKET_EVENTS.MATCH_RESULT, (data: { winnerId: string; isGameOver: boolean }) => {
      setMatchWinner(data.winnerId);
      setIsInputPhase(false);
    });

    socket.on(SOCKET_EVENTS.GAME_FINISHED, () => {
      setSequence([]);
      setIsInputPhase(false);
      setCountdown(null);
    });

    socket.on(SOCKET_EVENTS.SYSTEM_RESET, () => {
      setSession(null);
      setSequence([]);
      setIsInputPhase(false);
      setCountdown(null);
      setRoundWinner(null);
      setMatchWinner(null);
    });

    return () => {
      socket.off(SOCKET_EVENTS.SESSION_UPDATE);
      socket.off(SOCKET_EVENTS.COUNTDOWN_START);
      socket.off(SOCKET_EVENTS.SEQUENCE_SHOW);
      socket.off(SOCKET_EVENTS.INPUT_ENABLED);
      socket.off(SOCKET_EVENTS.ROUND_RESULT);
      socket.off(SOCKET_EVENTS.MATCH_RESULT);
      socket.off(SOCKET_EVENTS.GAME_FINISHED);
      socket.off(SOCKET_EVENTS.SYSTEM_RESET);
    };
  }, [socket]);

  const toggleReady = useCallback(() => {
    if (socket && isConnected) {
      socket.emit('player_ready');
    }
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
    displaySpeedMs,
    isInputPhase,
    roundWinner,
    matchWinner,
    toggleReady,
    submitSequence
  };
}
