import { api } from './api';
import { PlayerProfile } from '@/hooks/useAuth';

export interface MatchHistoryItem {
  id: string;
  difficulty: string;
  winnerId: string | null;
  createdAt: string;
  winner?: PlayerProfile;
  matchPlayers: {
    player: PlayerProfile;
  }[];
  rounds: {
    id: string;
    roundNumber: number;
    winnerId: string | null;
  }[];
}

export const historyService = {
  getHistory: async (page = 1, limit = 10): Promise<{ meta: any, items: MatchHistoryItem[] }> => {
    const response = await api.get('/history', { params: { page, limit } });
    return response.data.data;
  }
};
