import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LeaderboardService } from './leaderboard.service';

@ApiTags('Leaderboard')
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  @ApiOperation({
    summary: 'Get global leaderboard',
    description:
      'Returns player rankings sorted by wins, win rate, and completion speed',
  })
  async getLeaderboard() {
    return this.leaderboardService.getLeaderboard();
  }
}
