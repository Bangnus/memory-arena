'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSocket } from './useSocket';
import { gameService } from '@/services/game.service';
import { GAME_STATUS, COLOR } from '@/constants/game';
import { SOCKET_EVENTS } from '@/constants/socket';
import { DIFFICULTY_CONFIG } from '@/constants/game.config';

// Inline sound function to avoid hook dependency issues
function playBeepSound(frequency: number, duration: number) {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = frequency;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration / 1000);
  } catch {}
}

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
  const [displaySpeedMs, setDisplaySpeedMs] = useState(0);
  const [isInputPhase, setIsInputPhase] = useState(false);
  const [roundWinner, setRoundWinner] = useState<string | null>(null);
  const [matchWinner, setMatchWinner] = useState<string | null>(null);
  const [sequenceStartAt, setSequenceStartAt] = useState<number | null>(null);
  const [sequenceId, setSequenceId] = useState(0);



  const [p1LiveInputs, setP1LiveInputs] = useState<string[]>([]);
  const [p2LiveInputs, setP2LiveInputs] = useState<string[]>([]);

  // Derive display speed from backend event or fall back to difficulty config
  const effectiveDisplaySpeedMs = displaySpeedMs > 0
    ? displaySpeedMs
    : (session?.difficulty
        ? DIFFICULTY_CONFIG[session.difficulty as keyof typeof DIFFICULTY_CONFIG]?.displaySpeed ?? 800
        : 800);

  // Always fetch current session on mount and when connection status changes
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
      }
    }).catch(() => {});
  }, [isConnected]);

  useEffect(() => {
    if (!socket) return;

    socket.on(SOCKET_EVENTS.SESSION_UPDATE, (updatedSession: GameSession & { startAt?: number }) => {
      console.log(`[DEBUG][GAME][${Date.now()}] session:update received: status=${updatedSession.status}, round=${updatedSession.currentRound}, startAt=${updatedSession.startAt}`);
      setSession(updatedSession);
      if (updatedSession.currentSequence && Array.isArray(updatedSession.currentSequence) && updatedSession.currentSequence.length > 0) {
        setSequence(updatedSession.currentSequence);
      }
      // Only update startAt if the new value is LATER than current (avoid stale overwrite)
      if (updatedSession.startAt) {
        setSequenceStartAt(prev => {
          if (!prev || updatedSession.startAt! > prev) {
            console.log(`[DEBUG][GAME][${Date.now()}] session:update upgrading startAt: ${prev} -> ${updatedSession.startAt}`);
            return updatedSession.startAt!;
          }
          console.log(`[DEBUG][GAME][${Date.now()}] session:update NOT overwriting startAt: current=${prev}, incoming=${updatedSession.startAt}`);
          return prev;
        });
      }
    });

    socket.on(SOCKET_EVENTS.COUNTDOWN_START, (data: { count: number; startAt?: number }) => {
      console.log(`[DEBUG][GAME][${Date.now()}] countdown:start received: count=${data.count}, startAt=${data.startAt}`);
      setP1LiveInputs([]);
      setP2LiveInputs([]);

      // Animate countdown from count to 0
      let current = data.count;
      setCountdown(current);
      playBeepSound(800, 150);

      const tick = () => {
        if (current > 0) {
          current--;
          setCountdown(current);
          if (current > 0) {
            playBeepSound(800, 150);
            setTimeout(tick, 1000);
          } else {
            playBeepSound(1200, 200);
            setTimeout(() => setCountdown(null), 500);
          }
        }
      };
      setTimeout(tick, 1000);
    });

    socket.on(SOCKET_EVENTS.SEQUENCE_SHOW, (data: { sequence: string[]; displaySpeed?: number; displaySpeedMs?: number; startAt?: number }) => {
      const speed = data.displaySpeed ?? data.displaySpeedMs ?? 0;
      console.log(`[DEBUG][GAME][${Date.now()}] sequence:show received: seq=${JSON.stringify(data.sequence)}, speed=${speed}ms (raw displaySpeed=${data.displaySpeed}, displaySpeedMs=${data.displaySpeedMs}), startAt=${data.startAt}, delay=${data.startAt ? data.startAt - Date.now() : 'N/A'}ms`);
      setSequence(data.sequence);
      setDisplaySpeedMs(speed);
      setIsInputPhase(false);
      setRoundWinner(null);
      setP1LiveInputs([]);
      setP2LiveInputs([]);
      if (data.startAt) {
        setSequenceStartAt(data.startAt);
      }
      // Signal a new sequence arrived — only this triggers the animation effect
      setSequenceId(prev => prev + 1);
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

    socket.on(SOCKET_EVENTS.ROUND_RESULT, (data: { winnerPlayerNumber: number; winnerId?: string; nextRound?: number; player1Score: number; player2Score: number }) => {
      setRoundWinner(data.winnerId || (data.winnerPlayerNumber === 1 ? '1' : data.winnerPlayerNumber === 2 ? '2' : null));
      setIsInputPhase(false);
      setP1LiveInputs([]);
      setP2LiveInputs([]);
      setSession(prev => {
        if (!prev) return null;
        const updatedPlayers = prev.players?.map((p, idx) => {
          if (idx === 0) return { ...p, score: data.player1Score };
          if (idx === 1) return { ...p, score: data.player2Score };
          return p;
        });
        return {
          ...prev,
          currentRound: data.nextRound || (data.player1Score + data.player2Score + 1),
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
    displaySpeedMs: effectiveDisplaySpeedMs,
    isInputPhase,
    roundWinner,
    matchWinner,
    p1LiveInputs,
    p2LiveInputs,
    sequenceStartAt,
    sequenceId,
    toggleReady,
    submitSequence
  };
}
