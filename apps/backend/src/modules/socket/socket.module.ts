import { Global, Module, forwardRef } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { BroadcastService } from './broadcast.service';
import { GameModule } from '../game/game.module';
import { DeviceModule } from '../device/device.module';
import { SessionModule } from '../session/session.module';

@Global()
@Module({
  imports: [
    forwardRef(() => GameModule),
    forwardRef(() => DeviceModule),
    forwardRef(() => SessionModule),
  ],
  providers: [SocketGateway, BroadcastService],
  exports: [BroadcastService],
})
export class SocketModule {}
