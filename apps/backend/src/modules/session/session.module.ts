import { Module } from '@nestjs/common';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { GameModule } from '../game/game.module';
import { DeviceModule } from '../device/device.module';

@Module({
  imports: [GameModule, DeviceModule],
  controllers: [SessionController],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
