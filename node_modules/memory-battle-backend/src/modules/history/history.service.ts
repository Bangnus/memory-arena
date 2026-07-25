import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class HistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async getMatchHistory(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [total, items] = await Promise.all([
      this.prisma.match.count(),
      this.prisma.match.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          winner: true,
          matchPlayers: {
            include: {
              player: true,
            },
          },
          rounds: {
            orderBy: { roundNumber: 'asc' },
          },
        },
      }),
    ]);

    return {
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      items,
    };
  }

  async getMatchById(matchId: string) {
    return this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        winner: true,
        matchPlayers: {
          include: { player: true },
        },
        rounds: {
          orderBy: { roundNumber: 'asc' },
        },
      },
    });
  }
}
