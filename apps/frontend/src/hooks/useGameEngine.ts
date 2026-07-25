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
  currentRound?: number;
  currentSequence?: string[] | null;
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



  const [p1LiveInputs, setP1LiveInputs] = useState<string[]>([]);
  const [p2LiveInputs, setP2LiveInputs] = useState<string[]>([]);

  // Always fetch current session on mount and when connection status changes
  useEffect(() => {
    gameService.getCurrentSession().then((currentSession) => {
      if (currentSession) {
        setSession(currentSession);
        if (currentSession.currentSequence && Array.isArray(currentSession.currentSequence) && currentSession.currentSequence.length > 0) {
          setSequence(currentSession.currentSequence);
        }
      }
    }).catch(() => {});
  }, [isConnected]);

  useEffect(() => {
    if (!socket) return;

    socket.on(SOCKET_EVENTS.SESSION_UPDATE, (updatedSession: GameSession) => {
      setSession(updatedSession);
      if (updatedSession.currentSequence && Array.isArray(updatedSession.currentSequence) && updatedSession.currentSequence.length > 0) {
        setSequence(updatedSession.currentSequence);
      }
    });

    socket.on(SOCKET_EVENTS.COUNTDOWN_START, (data: { count: number }) => {
      setCountdown(data.count);
      setP1LiveInputs([]);
      setP2LiveInputs([]);
    });

    socket.on(SOCKET_EVENTS.SEQUENCE_SHOW, (data: { sequence: string[]; displaySpeedMs: number }) => {
      setSequence(data.sequence);
      setDisplaySpeedMs(data.displaySpeedMs);
      setIsInputPhase(false);
      setRoundWinner(null);
      setP1LiveInputs([]);
      setP2LiveInputs([]);
    });

    socket.on(SOCKET_EVENTS.INPUT_ENABLED, () => {
      setIsInputPhase(true);
      setP1LiveInputs([]);
      setP2LiveInputs([]);
    });

    socket.on(SOCKET_EVENTS.PLAYER_PROGRESS, (data: { playerNumber: number; color: string }) => {
      setIsInputPhase(true);
      if (data.playerNumber === 1) {
        setP1LiveInputs(prev => [...prev, data.color]);
      } else if (data.playerNumber === 2) {
        setP2LiveInputs(prev => [...prev, data.color]);
      }
    });

    socket.on(SOCKET_EVENTS.ROUND_RESULT, (data: { winnerPlayerNumber: number; winnerId?: string; player1Score: number; player2Score: number }) => {
      setRoundWinner(data.winnerId || (data.winnerPlayerNumber === 1 ? '1' : data.winnerPlayerNumber === 2 ? '2' : null));
      setIsInputPhase(false);
      setSession(prev => {
        if (!prev) return null;
        const updatedPlayers = prev.players?.map((p, idx) => {
          if (idx === 0) return { ...p, score: data.player1Score };
          if (idx === 1) return { ...p, score: data.player2Score };
          return p;
        });
        return {
          ...prev,
          player1Score: data.player1Score,
          player2Score: data.player2Score,
          players: updatedPlayers,
        };
      });
    });

    socket.on(SOCKET_EVENTS.MATCH_RESULT, (data: { winnerId: string; winnerPlayerNumber?: number; player1Score: number; player2Score: number }) => {
      setMatchWinner(data.winnerId || (data.winnerPlayerNumber === 1 ? '1' : '2'));
      setIsInputPhase(false);
      setSession(prev => {
        if (!prev) return null;
        const updatedPlayers = prev.players?.map((p, idx) => {
          if (idx === 0) return { ...p, score: data.player1Score };
          if (idx === 1) return { ...p, score: data.player2Score };
          return p;
        });
        return {
          ...prev,
          player1Score: data.player1Score,
          player2Score: data.player2Score,
          players: updatedPlayers,
        };
      });
    });

    socket.on(SOCKET_EVENTS.GAME_FINISHED, () => {
      setSequence([]);
      setIsInputPhase(false);
      setCountdown(null);
      setP1LiveInputs([]);
      setP2LiveInputs([]);
    });

    socket.on(SOCKET_EVENTS.SYSTEM_RESET, () => {
      setSession(null);
      setSequence([]);
      setIsInputPhase(false);
      setCountdown(null);
      setRoundWinner(null);
      setMatchWinner(null);
      setP1LiveInputs([]);
      setP2LiveInputs([]);
    });

    return () => {
      socket.off(SOCKET_EVENTS.SESSION_UPDATE);
      socket.off(SOCKET_EVENTS.COUNTDOWN_START);
      socket.off(SOCKET_EVENTS.SEQUENCE_SHOW);
      socket.off(SOCKET_EVENTS.INPUT_ENABLED);
      socket.off(SOCKET_EVENTS.PLAYER_PROGRESS);
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
    p1LiveInputs,
    p2LiveInputs,
    toggleReady,
    submitSequence
  };
}
