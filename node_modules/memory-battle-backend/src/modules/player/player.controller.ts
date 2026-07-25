import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PlayerService } from './player.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentPlayer } from '../../common/decorators/current-player.decorator';
import type { IJwtPayload } from '../../common/interfaces/api-response.interface';

@ApiTags('Player')
@Controller('player')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current player profile and stats',
    description: 'Returns authenticated player info and game statistics',
  })
  async getMyProfile(@CurrentPlayer() player: IJwtPayload) {
    return this.playerService.getPlayerProfile(player.sub);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get player profile by ID',
    description:
      'Returns public profile and statistics for specified player ID',
  })
  async getPlayerById(@Param('id') id: string) {
    return this.playerService.getPlayerProfile(id);
  }
}
