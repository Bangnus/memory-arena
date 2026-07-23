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

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'rank-1',
    rank: 1,
    score: 48,
    matchesPlayed: 52,
    winRate: 0.92,
    averageTimeMs: 1120,
    bestTimeMs: 890,
    player: {
      id: 'p-1',
      displayName: 'NeonKing 👑',
      pictureUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=NeonKing',
    }
  },
  {
    id: 'rank-2',
    rank: 2,
    score: 39,
    matchesPlayed: 45,
    winRate: 0.86,
    averageTimeMs: 1350,
    bestTimeMs: 1020,
    player: {
      id: 'p-2',
      displayName: 'CyberQueen ⚡',
      pictureUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=CyberQueen',
    }
  },
  {
    id: 'rank-3',
    rank: 3,
    score: 31,
    matchesPlayed: 40,
    winRate: 0.77,
    averageTimeMs: 1480,
    bestTimeMs: 1150,
    player: {
      id: 'p-3',
      displayName: 'PixelMaster 🎮',
      pictureUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=PixelMaster',
    }
  },
  {
    id: 'rank-4',
    rank: 4,
    score: 25,
    matchesPlayed: 32,
    winRate: 0.78,
    averageTimeMs: 1620,
    bestTimeMs: 1240,
    player: {
      id: 'dev-player-1',
      displayName: 'Dev Champion (You)',
      pictureUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=DevChampion',
    }
  },
  {
    id: 'rank-5',
    rank: 5,
    score: 20,
    matchesPlayed: 28,
    winRate: 0.71,
    averageTimeMs: 1810,
    bestTimeMs: 1390,
    player: {
      id: 'p-5',
      displayName: 'TurboSpeed 🚀',
      pictureUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=TurboSpeed',
    }
  },
  {
    id: 'rank-6',
    rank: 6,
    score: 15,
    matchesPlayed: 22,
    winRate: 0.68,
    averageTimeMs: 1950,
    bestTimeMs: 1420,
    player: {
      id: 'p-6',
      displayName: 'MemoryNinja 🥷',
      pictureUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=MemoryNinja',
    }
  }
];

export const leaderboardService = {
  getTopPlayers: async (limit = 10): Promise<LeaderboardEntry[]> => {
    try {
      const response = await api.get('/leaderboard', { params: { limit } });
      if (response.data?.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
        return response.data.data;
      }
      return MOCK_LEADERBOARD.slice(0, limit);
    } catch (err) {
      console.warn('Backend unavailable, using mock leaderboard data for dev preview');
      return MOCK_LEADERBOARD.slice(0, limit);
    }
  }
};
