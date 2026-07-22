import { api } from './api';

export interface LeaderboardEntry {
  id: string;
  rank: number;
  score: number; // wins
  matchesPlayed: number;
  winRate: number;
  averageTimeMs: number;
  bestTimeMs: number;
  player: {
    id: string;
    displayName: string;
    pictureUrl: string | null;
  };
}

export const leaderboardService = {
  getTopPlayers: async (limit = 10): Promise<LeaderboardEntry[]> => {
    const response = await api.get('/leaderboard', { params: { limit } });
    return response.data.data; // Assuming backend returns { data: [...] }
  }
};
