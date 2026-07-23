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

const MOCK_HISTORY: MatchHistoryItem[] = [
  {
    id: 'match-101',
    difficulty: 'EASY',
    winnerId: 'dev-player-1',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    winner: {
      id: 'dev-player-1',
      lineId: 'line-1',
      displayName: 'Dev Champion',
      pictureUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=DevChampion'
    },
    matchPlayers: [
      {
        player: {
          id: 'dev-player-1',
          lineId: 'line-1',
          displayName: 'Dev Champion',
          pictureUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=DevChampion'
        }
      },
      {
        player: {
          id: 'p-2',
          lineId: 'line-2',
          displayName: 'CyberQueen ⚡',
          pictureUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=CyberQueen'
        }
      }
    ],
    rounds: [
      { id: 'r-1', roundNumber: 1, winnerId: 'dev-player-1' },
      { id: 'r-2', roundNumber: 2, winnerId: 'dev-player-1' }
    ]
  },
  {
    id: 'match-102',
    difficulty: 'MEDIUM',
    winnerId: 'p-1',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    winner: {
      id: 'p-1',
      lineId: 'line-p1',
      displayName: 'NeonKing 👑',
      pictureUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=NeonKing'
    },
    matchPlayers: [
      {
        player: {
          id: 'dev-player-1',
          lineId: 'line-1',
          displayName: 'Dev Champion',
          pictureUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=DevChampion'
        }
      },
      {
        player: {
          id: 'p-1',
          lineId: 'line-p1',
          displayName: 'NeonKing 👑',
          pictureUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=NeonKing'
        }
      }
    ],
    rounds: [
      { id: 'r-1', roundNumber: 1, winnerId: 'p-1' },
      { id: 'r-2', roundNumber: 2, winnerId: 'dev-player-1' },
      { id: 'r-3', roundNumber: 3, winnerId: 'p-1' }
    ]
  },
  {
    id: 'match-103',
    difficulty: 'HARD',
    winnerId: 'p-3',
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(), // 6 hours ago
    winner: {
      id: 'p-3',
      lineId: 'line-p3',
      displayName: 'PixelMaster 🎮',
      pictureUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=PixelMaster'
    },
    matchPlayers: [
      {
        player: {
          id: 'p-3',
          lineId: 'line-p3',
          displayName: 'PixelMaster 🎮',
          pictureUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=PixelMaster'
        }
      },
      {
        player: {
          id: 'p-5',
          lineId: 'line-p5',
          displayName: 'TurboSpeed 🚀',
          pictureUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=TurboSpeed'
        }
      }
    ],
    rounds: [
      { id: 'r-1', roundNumber: 1, winnerId: 'p-3' },
      { id: 'r-2', roundNumber: 2, winnerId: 'p-3' }
    ]
  }
];

export const historyService = {
  getHistory: async (page = 1, limit = 10): Promise<{ meta: any, items: MatchHistoryItem[] }> => {
    try {
      const response = await api.get('/history', { params: { page, limit } });
      if (response.data?.data && Array.isArray(response.data.data.items)) {
        return response.data.data;
      }
      return { meta: { total: MOCK_HISTORY.length, page, limit }, items: MOCK_HISTORY };
    } catch (err) {
      console.warn('Backend unavailable, using mock match history for dev preview');
      return { meta: { total: MOCK_HISTORY.length, page, limit }, items: MOCK_HISTORY };
    }
  }
};
