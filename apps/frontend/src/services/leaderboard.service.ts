import { api } from './api';

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  displayName: string;
  pictureUrl: string | null;
  score: number;
  wins: number;
  games: number;
  winRate: number;
  avgTimeMs?: number;
}

export const leaderboardService = {
  getTopPlayers: async (limit = 10): Promise<LeaderboardEntry[]> => {
    const response = await api.get('/leaderboard', { params: { limit } });
    if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  }
};
