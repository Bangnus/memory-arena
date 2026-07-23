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

  // Default mock session for dev previewing when socket is not connected
  const [mockSession, setMockSession] = useState<GameSession>({
    id: 'mock-session-123',
    status: 'WAITING',
    difficulty: 'EASY',
    players: [
      {
        id: 'dev-player-1',
        displayName: 'Dev Champion',
        pictureUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=DevChampion',
        isReady: false,
        score: 1,
      },
      {
        id: 'p-2',
        displayName: 'CyberOpponent 🤖',
        pictureUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=CyberOpponent',
        isReady: true,
        score: 0,
      }
    ]
  });

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

  // Interactive Mock simulation when offline
  const toggleReady = useCallback(() => {
    if (socket && isConnected) {
      socket.emit('player_ready');
    } else {
      // Mock toggle ready & start mock game sequence
      setMockSession(prev => {
        const nextReady = !prev.players[0].isReady;
        const updatedPlayers = prev.players.map((p, idx) => 
          idx === 0 ? { ...p, isReady: nextReady } : p
        );

        if (nextReady) {
          // Trigger mock 3-2-1 countdown & game round
          let count = 3;
          setCountdown(3);
          const timer = setInterval(() => {
            count--;
            if (count >= 0) {
              setCountdown(count);
            } else {
              clearInterval(timer);
              setCountdown(null);
              // Play sequence
              setSequence([COLOR.RED, COLOR.GREEN, COLOR.BLUE]);
              setDisplaySpeedMs(800);
              setTimeout(() => {
                setIsInputPhase(true);
              }, 2500);
            }
          }, 1000);
        }

        return { ...prev, players: updatedPlayers };
      });
    }
  }, [socket, isConnected]);

  const submitSequence = useCallback((playerSequence: string[]) => {
    if (socket && isConnected && isInputPhase) {
      socket.emit('submit_sequence', { sequence: playerSequence });
      setIsInputPhase(false);
    } else if (isInputPhase) {
      // Mock round victory for dev preview
      setIsInputPhase(false);
      setRoundWinner('dev-player-1');
      setMockSession(prev => ({
        ...prev,
        players: prev.players.map((p, idx) => idx === 0 ? { ...p, score: p.score + 1 } : p)
      }));
    }
  }, [socket, isConnected, isInputPhase]);

  return {
    isConnected: true, // Always allow dev previewing
    session: session || mockSession,
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
