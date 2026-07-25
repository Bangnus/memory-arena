import { Controller, Get, Post, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GameEngineService } from './services/game-engine.service';
import { SubmitInputDto } from './dto/submit-input.dto';

@ApiTags('Game Engine')
@Controller('game')
export class GameController {
  private readonly logger = new Logger(GameController.name);

  constructor(private readonly gameEngine: GameEngineService) {}

  @Get('current')
  @ApiOperation({
    summary: 'Get current game state',
    description: 'Returns details of current active game session',
  })
  async getCurrentState() {
    this.logger.debug('ESP32 Polling /game/current');
    return this.gameEngine.getCurrentSession();
  }

  @Get('sequence')
  @ApiOperation({
    summary: 'Get current color sequence',
    description:
      'ESP32 calls this endpoint to fetch the memory sequence and display speed',
  })
  async getSequence() {
    this.logger.debug('ESP32 Polling /game/sequence');
    return this.gameEngine.getCurrentSequence();
  }

  @Post('input')
  @ApiOperation({
    summary: 'Submit player inputs for round',
    description:
      'ESP32 posts inputs from both players after memory sequence finish',
  })
  @ApiResponse({
    status: 200,
    description: 'Inputs processed and round result returned',
  })
  async submitInput(@Body() dto: SubmitInputDto) {
    this.logger.debug(`ESP32 Submit Input: ${JSON.stringify(dto)}`);
    return this.gameEngine.processRoundInput(dto);
  }

  @Post('play')
  @ApiOperation({
    summary: 'Unified single-request round submission',
    description:
      'Optimized single endpoint for ESP32 to submit round input and receive next round sequence',
  })
  async playRound(@Body() dto: SubmitInputDto) {
    return this.gameEngine.processRoundInput(dto);
  }
}
