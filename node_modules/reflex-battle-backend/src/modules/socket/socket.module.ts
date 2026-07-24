import { Global, Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { BroadcastService } from './broadcast.service';

@Global()
@Module({
  providers: [SocketGateway, BroadcastService],
  exports: [BroadcastService],
})
export class SocketModule {}
