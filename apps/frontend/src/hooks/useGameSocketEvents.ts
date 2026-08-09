import { useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { SOCKET_EVENTS } from '@/constants/socket';
import { GameSession } from './useGameEngine';

interface GameSocketEventsProps {
  socket: Socket | null;
  getSyncedTime?: () => number;
  setSession: React.Dispatch<React.SetStateAction<GameSession | null>>;
  setCountdown: React.Dispatch<React.SetStateAction<number | null>>;
  setSequence: React.Dispatch<React.SetStateAction<string[]>>;
  setDisplaySpeedMs: React.Dispatch<React.SetStateAction<number>>;
  setIsInputPhase: React.Dispatch<React.SetStateAction<boolean>>;
  setRoundWinner: React.Dispatch<React.SetStateAction<string | null>>;
  setMatchWinner: React.Dispatch<React.SetStateAction<string | null>>;
  setSequenceStartAt: React.Dispatch<React.SetStateAction<number | null>>;
  setSequenceId: React.Dispatch<React.SetStateAction<number>>;
  setIsSequenceDisplaying: React.Dispatch<React.SetStateAction<boolean>>;
  setP1LiveInputs: React.Dispatch<React.SetStateAction<string[]>>;
  setP2LiveInputs: React.Dispatch<React.SetStateAction<string[]>>;
}

export function useGameSocketEvents({
  socket,
  getSyncedTime = Date.now,
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
}: GameSocketEventsProps) {
  useEffect(() => {
    if (!socket) return;

    socket.on(SOCKET_EVENTS.SESSION_UPDATE, (updatedSession: GameSession & { startAt?: number }) => {
      console.log(`[DEBUG][GAME][${getSyncedTime()}] session:update received: status=${updatedSession.status}, round=${updatedSession.currentRound}, startAt=${updatedSession.startAt}`);
      setSession(updatedSession);
      if (updatedSession.currentSequence && Array.isArray(updatedSession.currentSequence) && updatedSession.currentSequence.length > 0) {
        setSequence(updatedSession.currentSequence);
      }
      if (updatedSession.startAt) {
        setSequenceStartAt(prev => {
          const incomingStartAt = updatedSession.startAt!;
          if (!prev || incomingStartAt > prev) {
            console.log(`[DEBUG][GAME][${getSyncedTime()}] session:update upgrading startAt: ${prev} -> ${incomingStartAt}`);
            return incomingStartAt;
          }
          console.log(`[DEBUG][GAME][${getSyncedTime()}] session:update NOT overwriting startAt: current=${prev}, incoming=${incomingStartAt}`);
          return prev;
        });
      }
    });

    socket.on(SOCKET_EVENTS.COUNTDOWN_START, (data: { count: number; startAt?: number }) => {
      console.log(`[DEBUG][GAME][${getSyncedTime()}] countdown:start received: count=${data.count}, startAt=${data.startAt}`);
      setP1LiveInputs([]);
      setP2LiveInputs([]);
      setSequenceStartAt(null);

      let current = data.count;
      setCountdown(current);

      const tick = () => {
        if (current > 1) {
          current--;
          console.log(`[DEBUG][GAME][${getSyncedTime()}] countdown tick: ${current}`);
          setCountdown(current);
          setTimeout(tick, 1000);
        } else {
          console.log(`[DEBUG][GAME][${getSyncedTime()}] countdown complete`);
          setCountdown(null);
        }
      };
      setTimeout(tick, 1000);
    });

    socket.on(SOCKET_EVENTS.SEQUENCE_SHOW, (data: { sequence: string[]; displaySpeed?: number; displaySpeedMs?: number; startAt?: number; startInMs?: number }) => {
      const speed = data.displaySpeed ?? data.displaySpeedMs ?? 0;
      console.log(`[DEBUG][GAME][${getSyncedTime()}] sequence:show received: seq=${JSON.stringify(data.sequence)}, speed=${speed}ms (raw displaySpeed=${data.displaySpeed}, displaySpeedMs=${data.displaySpeedMs}), startAt=${data.startAt}, startInMs=${data.startInMs}`);
      setSequence(data.sequence);
      setDisplaySpeedMs(speed);
      setIsInputPhase(false);
      setRoundWinner(null);
      setP1LiveInputs([]);
      setP2LiveInputs([]);
      if (data.startInMs !== undefined) {
        setSequenceStartAt(getSyncedTime() + data.startInMs);
      } else if (data.startAt) {
        setSequenceStartAt(data.startAt);
      }
      setSequenceId(prev => prev + 1);
      setIsSequenceDisplaying(true);
    });

    socket.on(SOCKET_EVENTS.INPUT_ENABLED, () => {
      setIsInputPhase(true);
      setIsSequenceDisplaying(false);
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
      setIsSequenceDisplaying(false);
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
      setIsSequenceDisplaying(false);
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
      setIsSequenceDisplaying(false);
      setCountdown(null);
      setP1LiveInputs([]);
      setP2LiveInputs([]);
    });

    socket.on(SOCKET_EVENTS.SYSTEM_RESET, () => {
      setSession(null);
      setSequence([]);
      setIsInputPhase(false);
      setIsSequenceDisplaying(false);
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
}
