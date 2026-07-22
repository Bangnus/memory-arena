'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSocket } from './useSocket';
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
  players: PlayerState[];
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

  useEffect(() => {
    if (!socket) return;

    socket.on('session_updated', (data: { session: GameSession }) => {
      setSession(data.session);
    });

    socket.on('countdown', (data: { count: number }) => {
      setCountdown(data.count);
    });

    socket.on('show_sequence', (data: { sequence: string[]; displaySpeedMs: number }) => {
      setSequence(data.sequence);
      setDisplaySpeedMs(data.displaySpeedMs);
      setIsInputPhase(false);
      setRoundWinner(null);
    });

    socket.on('input_phase', () => {
      setIsInputPhase(true);
    });

    socket.on('round_result', (data: { winnerId: string; players: PlayerState[] }) => {
      setRoundWinner(data.winnerId);
      setIsInputPhase(false);
      setSession(prev => prev ? { ...prev, players: data.players } : null);
    });

    socket.on('match_result', (data: { winnerId: string; isGameOver: boolean }) => {
      setMatchWinner(data.winnerId);
      setIsInputPhase(false);
    });

    socket.on('game_finished', () => {
      setSequence([]);
      setIsInputPhase(false);
      setCountdown(null);
    });

    return () => {
      socket.off('session_updated');
      socket.off('countdown');
      socket.off('show_sequence');
      socket.off('input_phase');
      socket.off('round_result');
      socket.off('match_result');
      socket.off('game_finished');
    };
  }, [socket]);

  const toggleReady = useCallback(() => {
    if (socket) {
      socket.emit('player_ready');
    }
  }, [socket]);

  const submitSequence = useCallback((playerSequence: string[]) => {
    if (socket && isInputPhase) {
      socket.emit('submit_sequence', { sequence: playerSequence });
      setIsInputPhase(false); // Optimistically lock inputs
    }
  }, [socket, isInputPhase]);

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
