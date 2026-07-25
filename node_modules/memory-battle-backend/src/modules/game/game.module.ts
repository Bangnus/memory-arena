import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameEngineService } from './services/game-engine.service';
import { SequenceService } from './services/sequence.service';
import { ValidatorService } from './services/validator.service';
import { ScoringService } from './services/scoring.service';
import { StateMachineService } from './services/state-machine.service';

@Module({
  controllers: [GameController],
  providers: [
    GameEngineService,
    SequenceService,
    ValidatorService,
    ScoringService,
    StateMachineService,
  ],
  exports: [
    GameEngineService,
    SequenceService,
    ValidatorService,
    ScoringService,
    StateMachineService,
  ],
})
export class GameModule {}
