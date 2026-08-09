import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { BroadcastService } from './broadcast.service';
import { GameEngineService } from '../game/services/game-engine.service';
import { DeviceService } from '../device/device.service';
import { SessionService } from '../session/session.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  pingInterval: 25000,
  pingTimeout: 60000,
  allowEIO3: true,
})
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(SocketGateway.name);

  constructor(
    private readonly broadcastService: BroadcastService,
    private readonly gameEngine: GameEngineService,
    private readonly deviceService: DeviceService,
    private readonly sessionService: SessionService,
  ) {}

  afterInit(server: Server): void {
    this.broadcastService.setServer(server);
    this.logger.log('SocketGateway initialized successfully');
  }

  handleConnection(client: Socket) {
    this.logger.log(`[WS] Connected: ${client.id} transport=${client.conn.transport.name} query=${JSON.stringify(client.handshake.query)}`);
    client.conn.on('upgrade', (transport: any) => {
      this.logger.log(`[WS] Upgraded: ${client.id} -> ${transport.name}`);
    });
  }

  handleDisconnect(client: Socket, reason?: string) {
    this.logger.log(`[WS] Disconnected: ${client.id} reason=${reason ?? 'unknown'}`);
  }

  @SubscribeMessage('device:heartbeat')
  async handleHeartbeat(
    @MessageBody() data: { deviceId: string; firmwareVersion: string; status: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.deviceService.updateHeartbeat(data.deviceId);
    client.emit('device:heartbeat:ack', { acknowledged: true, serverTimeMs: Date.now() });
  }

  @SubscribeMessage('time:sync')
  handleTimeSync(@MessageBody() data: { clientTime: number }, @ConnectedSocket() client: Socket) {
    client.emit('time:sync:ack', { clientTime: data.clientTime, serverTime: Date.now() });
  }

  @SubscribeMessage('game:press')
  handlePress(@MessageBody() data: { playerNumber: number; color: string }) {
    this.gameEngine.broadcastPress(data.playerNumber, data.color);
  }

  @SubscribeMessage('game:input')
  async handleInput(
    @MessageBody() data: { sessionId: string; round: number; player1: any; player2: any },
  ) {
    try {
      const result = await this.gameEngine.processRoundInput(data);
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  @SubscribeMessage('device:start')
  handleStart() {
    this.logger.log('START from IoT');
    this.broadcastService.emit('device:start', { timestamp: new Date().toISOString() });
  }

  @SubscribeMessage('device:mode')
  handleModeChange(@MessageBody() data: { mode: number }) {
    this.broadcastService.emit('device:mode_change', { mode: data.mode });
  }

  @SubscribeMessage('session:difficulty')
  async handleDifficulty(
    @MessageBody() data: { difficulty: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      await this.sessionService.setDifficulty({ difficulty: data.difficulty as any });
      client.emit('session:difficulty:ack', { success: true });
    } catch (err) {
      client.emit('session:difficulty:ack', { success: false, error: err.message });
    }
  }
}
