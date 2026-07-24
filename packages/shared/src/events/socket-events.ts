export interface ISocketEventPayloads {
  'session:update': { sessionId: string; status: string; players?: unknown[] };
  'countdown:start': { sessionId: string; countdown: number };
  'sequence:show': { sessionId: string; sequence: number[] };
  'input:enabled': { sessionId: string; roundNumber: number };
  'player:progress': { sessionId: string; playerNumber: 1 | 2; progress: number };
  'round:result': { sessionId: string; winnerPlayerNumber: 1 | 2 | null; shouldRestartRound: boolean };
  'match:result': { sessionId: string; winnerPlayerNumber: 1 | 2 | null };
  'leaderboard:update': { updated: boolean };
  'system:reset': { reset: true };
}

export type SocketEventName = keyof ISocketEventPayloads;
