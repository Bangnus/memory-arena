import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

export interface ILeaderboardEntry {
  rank: number;
  playerId: string;
  displayName: string;
  pictureUrl: string | null;
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
          wins,
          games,
          winRate,
          avgTimeMs,
        };
      }),
    );

    // Sort by wins (desc), then winRate (desc), then avgTimeMs (asc)
    entries.sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (b.winRate !== a.winRate) return b.winRate - a.winRate;
      return a.avgTimeMs - b.avgTimeMs;
    });

    // Assign rank
    return entries.map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }));
  }
}
