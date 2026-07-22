import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class PlayerService {
  constructor(private readonly prisma: PrismaService) {}

  async getPlayerProfile(playerId: string) {
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
    });

    if (!player) {
      throw new NotFoundException('Player profile not found');
    }

    const totalMatches = await this.prisma.matchPlayer.count({
      where: { playerId },
    });

    const totalWins = await this.prisma.match.count({
      where: { winnerId: playerId },
    });

    const winRate =
      totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0;

    return {
      player,
      statistics: {
        totalMatches,
        totalWins,
        totalLosses: totalMatches - totalWins,
        winRate,
      },
    };
  }
}
