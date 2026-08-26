import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { GAME_CONSTANTS } from '../../common/constants/game.constants';
import { Difficulty } from '../../common/enums';

export interface ILeaderboardEntry {
  rank: number;
  playerId: string;
  displayName: string;
  pictureUrl: string | null;
  score: number;
  wins: number;
  games: number;
  winRate: number;
  avgTimeMs: number;
}

@Injectable()
export class LeaderboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getLeaderboard(): Promise<ILeaderboardEntry[]> {
    const players = await this.prisma.player.findMany({
      include: {
        wonMatches: true,
        matchPlayers: {
          include: {
            match: true,
          },
        },
      },
    });

    const entries = await Promise.all(
      players.map(async (player) => {
        const games = player.matchPlayers.length;
        const wins = player.wonMatches.length;
        const winRate = games > 0 ? Math.round((wins / games) * 100) : 0;

        // Calculate total weighted score from all played matches
        let score = 0;

        for (const mp of player.matchPlayers) {
          const match = mp.match;
          if (!match) continue;

          const isWinner = match.winnerId === player.id;
          const diff = (match.difficulty?.toUpperCase() || Difficulty.MEDIUM) as Difficulty;
          const winPoints =
            GAME_CONSTANTS.LEADERBOARD.WIN_POINTS[diff] ??
            GAME_CONSTANTS.LEADERBOARD.WIN_POINTS[Difficulty.MEDIUM];

          if (isWinner) {
            score += winPoints;
            // Clean sweep bonus (e.g. 2-0: loser has 0 points while winner has > 0)
            const isCleanSweep =
              (match.player1Score > 0 && match.player2Score === 0) ||
              (match.player2Score > 0 && match.player1Score === 0);
            if (isCleanSweep) {
              score += GAME_CONSTANTS.LEADERBOARD.CLEAN_SWEEP_BONUS;
            }
          } else {
            // Participation points for playing the match
            score += GAME_CONSTANTS.LEADERBOARD.PARTICIPATION_POINTS;
          }
        }

        // Calculate average round completion time
        const roundsP1 = await this.prisma.round.aggregate({
          where: {
            match: {
              matchPlayers: { some: { playerId: player.id, playerNumber: 1 } },
            },
          },
          _avg: { player1Time: true },
        });

        const roundsP2 = await this.prisma.round.aggregate({
          where: {
            match: {
              matchPlayers: { some: { playerId: player.id, playerNumber: 2 } },
            },
          },
          _avg: { player2Time: true },
        });

        const t1 = roundsP1._avg.player1Time || 0;
        const t2 = roundsP2._avg.player2Time || 0;
        const avgTimeMs =
          t1 > 0 && t2 > 0
            ? Math.round((t1 + t2) / 2)
            : Math.round(t1 || t2 || 0);

        return {
          playerId: player.id,
          displayName: player.displayName,
          pictureUrl: player.pictureUrl,
          score,
          wins,
          games,
          winRate,
          avgTimeMs,
        };
      }),
    );

    // Sort by:
    // 1. Active players (games > 0) before unplayed players (games === 0)
    // 2. Score / Total Points (desc)
    // 3. Wins (desc)
    // 4. Win Rate (desc)
    // 5. Total games played (desc)
    // 6. Display Name (asc)
    entries.sort((a, b) => {
      // 1. Players who played come before players who never played
      if (a.games > 0 && b.games === 0) return -1;
      if (a.games === 0 && b.games > 0) return 1;

      // 2. Sort by score (desc)
      if (b.score !== a.score) return b.score - a.score;

      // 3. Sort by wins (desc)
      if (b.wins !== a.wins) return b.wins - a.wins;

      // 4. Sort by win rate (desc)
      if (b.winRate !== a.winRate) return b.winRate - a.winRate;

      // 5. Sort by matches played (desc)
      if (b.games !== a.games) return b.games - a.games;

      return a.displayName.localeCompare(b.displayName);
    });

    // Assign rank
    return entries.map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }));
  }
}
