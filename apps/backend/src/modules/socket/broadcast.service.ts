import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { SocketEvent } from '../../common/enums';

@Injectable()
export class BroadcastService {
  private readonly logger = new Logger(BroadcastService.name);
  private server: Server | null = null;
  public readonly sequenceStartAt = new Map<string, number>();

  setServer(server: Server): void {
    this.server = server;
    this.logger.log('Socket.IO Server instance assigned to BroadcastService');
  }

  emit(event: SocketEvent | string, data: unknown): void {
    if (this.server) {
      this.server.emit(event, data);
      this.logger.debug(
        `Socket Broadcast -> [${event}]: ${JSON.stringify(data)}`,
      );
    } else {
      this.logger.warn(
        `Socket Broadcast skipped (Server not ready) -> [${event}]`,
      );
    }
  }

  emitToRoom(room: string, event: SocketEvent | string, data: unknown): void {
    if (this.server) {
      this.server.to(room).emit(event, data);
      this.logger.debug(
        `Socket Room Broadcast (${room}) -> [${event}]: ${JSON.stringify(data)}`,
      );
    }
  }
}
