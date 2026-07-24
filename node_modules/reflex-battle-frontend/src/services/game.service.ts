import { api } from './api';

export interface GameSession {
  id: string;
  status: string;
  difficulty: string;
  player1Id: string | null;
  player2Id: string | null;
  currentRound: number;
  player1Score: number;
  player2Score: number;
}

export interface CreateSessionResponse {
  sessionId: string;
}

export interface JoinSessionResponse {
  session: GameSession;
}

export interface StartGameResponse {
  session: GameSession;
}

export const gameService = {
  createSession: async (difficulty: string): Promise<CreateSessionResponse> => {
    const response = await api.post('/game/session', { difficulty });
    return response.data.data;
  },

  joinSession: async (sessionId: string): Promise<JoinSessionResponse> => {
    const response = await api.post(`/game/session/${sessionId}/join`);
    return response.data.data;
  },

  startGame: async (sessionId: string): Promise<StartGameResponse> => {
    const response = await api.post(`/game/session/${sessionId}/start`);
    return response.data.data;
  },

  getSequence: async (sessionId: string): Promise<number[]> => {
    const response = await api.get(`/game/session/${sessionId}/sequence`);
    return response.data.data.sequence;
  },

  submitInput: async (sessionId: string, input: number[]): Promise<void> => {
    await api.post(`/game/session/${sessionId}/input`, { input });
  },

  getSession: async (sessionId: string): Promise<GameSession> => {
    const response = await api.get(`/game/session/${sessionId}`);
    return response.data.data;
  },

  getActiveSessions: async (): Promise<GameSession[]> => {
    const response = await api.get('/game/sessions/active');
    return response.data.data;
  },
};
