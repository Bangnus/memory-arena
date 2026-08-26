export interface Player {
  id: string;
  displayName: string;
  avatar: string;
  pictureUrl: string | null;
  score: number;
}

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

export interface Round {
  id: string;
  sequence: string[];
  player1Input: string[];
  player2Input: string[];
  winner: string | null;
  elapsedTime: number;
}

export interface GameSession {
  id: string;
  player1: Player;
  player2: Player;
  rounds: Round[];
  currentRound: number;
  difficulty: 'EASY' | 'NORMAL' | 'HARD';
  status: 'WAITING' | 'COUNTDOWN' | 'PLAYING' | 'FINISHED';
  winner: string | null;
  createdAt: string;
}

export interface MatchHistory {
  id: string;
  winner: Player;
  loser: Player;
  difficulty: string;
  rounds: number;
  duration: number;
  createdAt: string;
}

export type Difficulty = 'EASY' | 'NORMAL' | 'HARD';

export type GameStatus = 'WAITING' | 'COUNTDOWN' | 'PLAYING' | 'FINISHED';

export type LedColor = 'RED' | 'GREEN' | 'BLUE' | 'YELLOW';
