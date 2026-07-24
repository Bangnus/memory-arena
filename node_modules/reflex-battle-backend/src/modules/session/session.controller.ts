import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SessionService } from './session.service';
import { JoinPlayerDto } from './dto/join-player.dto';
import { SelectDifficultyDto } from './dto/select-difficulty.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentPlayer } from '../../common/decorators/current-player.decorator';
import type { IJwtPayload } from '../../common/interfaces/api-response.interface';

@ApiTags('Session')
@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get()
  @ApiOperation({
    summary: 'Get current active session',
    description: 'Returns or initializes current active GameSession',
  })
  async getSession() {
    return this.sessionService.getOrCreateSession();
  }

  @Post('player')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Register player into session slot',
    description: 'Assigns authenticated player to slot 1 or 2',
  })
  async joinPlayer(
    @CurrentPlayer() player: IJwtPayload,
    @Body() dto: JoinPlayerDto,
  ) {
    return this.sessionService.joinPlayer(player.sub, dto);
  }

  @Post('difficulty')
  @ApiOperation({
    summary: 'Select game difficulty',
    description: 'Sets difficulty mode (EASY, MEDIUM, HARD) before match start',
  })
  async setDifficulty(@Body() dto: SelectDifficultyDto) {
    return this.sessionService.setDifficulty(dto);
  }

  @Post('start')
  @ApiOperation({
    summary: 'Start game match',
    description:
      'Initiates 3-second countdown and sequence generation for 2 joined players',
  })
  async startMatch() {
    return this.sessionService.startMatch();
  }

  @Post('reset')
  @ApiOperation({
    summary: 'Reset current game session',
    description: 'Clears current active session state and returns to WAITING',
  })
  async resetSession() {
    return this.sessionService.resetSession();
  }
}
