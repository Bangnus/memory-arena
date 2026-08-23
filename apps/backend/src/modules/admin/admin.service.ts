import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { BroadcastService } from '../socket/broadcast.service';
import { SocketEvent } from '../../common/enums';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly broadcast: BroadcastService,
  ) {}

  /**
   * Reset active game session: clears only current game sessions, leaving players, matches, and leaderboard intact.
   */
  async resetSystem() {
    this.logger.warn(
      'Session reset initiated. Clearing current game session (match history & leaderboard preserved)...',
    );

    await this.prisma.gameSession.deleteMany();

    this.broadcast.emit(SocketEvent.SYSTEM_RESET, { reset: true });

    return {
      message:
        'Active game session reset completed successfully. Match history and leaderboard preserved.',
    };
  }

  /**
   * Export match history in JSON or CSV format
   */
  async exportData(format: 'json' | 'csv' = 'json') {
    const matches = await this.prisma.match.findMany({
      include: {
        winner: true,
        matchPlayers: { include: { player: true } },
        rounds: true,
      },
    });

    if (format === 'csv') {
      const headers =
        'MatchID,Difficulty,WinnerID,WinnerName,P1Score,P2Score,RoundsCount,CreatedAt\n';
      const rows = matches
        .map((m) => {
          const winnerName = m.winner
            ? `"${m.winner.displayName.replace(/"/g, '""')}"`
            : 'None';
          return `${m.id},${m.difficulty},${m.winnerId || 'NONE'},${winnerName},${m.player1Score},${m.player2Score},${m.rounds.length},${m.createdAt.toISOString()}`;
        })
        .join('\n');
      return headers + rows;
    }

    return matches;
  }

  /**
   * Admin dashboard metrics
   */
  async getDashboardMetrics() {
    const [totalPlayers, totalMatches, totalRounds, activeSession] =
      await Promise.all([
        this.prisma.player.count(),
        this.prisma.match.count(),
        this.prisma.round.count(),
        this.prisma.gameSession.findFirst({ orderBy: { createdAt: 'desc' } }),
      ]);

    return {
      totalPlayers,
      totalMatches,
      totalRounds,
      activeSession,
      uptimeSeconds: Math.floor(process.uptime()),
    };
  }
}
