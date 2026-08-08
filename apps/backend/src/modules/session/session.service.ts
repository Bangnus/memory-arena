import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { BroadcastService } from '../socket/broadcast.service';
import { SequenceService } from '../game/services/sequence.service';
import { Difficulty, SessionStatus, SocketEvent } from '../../common/enums';
import { JoinPlayerDto } from './dto/join-player.dto';
import { SelectDifficultyDto } from './dto/select-difficulty.dto';
import { DeviceService } from '../device/device.service';
import { GAME_CONSTANTS } from '../../common/constants/game.constants';

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly broadcast: BroadcastService,
    private readonly sequenceService: SequenceService,
    private readonly deviceService: DeviceService,
  ) {}

  private async attachPlayers(session: any) {
    const players: any[] = [];
    if (session.player1Id) {
      const p1 = await this.prisma.player.findUnique({ where: { id: session.player1Id } });
      if (p1) players.push({ id: p1.id, displayName: p1.displayName, pictureUrl: p1.pictureUrl, score: session.player1Score, isReady: true });
    }
    if (session.player2Id) {
      const p2 = await this.prisma.player.findUnique({ where: { id: session.player2Id } });
      if (p2) players.push({ id: p2.id, displayName: p2.displayName, pictureUrl: p2.pictureUrl, score: session.player2Score, isReady: true });
    }
    const startAt = this.broadcast.sequenceStartAt.get(session.id) || null;
    return { ...session, players, startAt };
  }

  /**
   * Gets or creates the active game session
   */
  async getOrCreateSession() {
    let session = await this.prisma.gameSession.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!session) {
      session = await this.prisma.gameSession.create({
        data: {
          status: SessionStatus.WAITING,
          difficulty: Difficulty.MEDIUM,
          currentRound: 1,
          player1Score: 0,
          player2Score: 0,
        },
      });
      this.logger.log(`Created new GameSession: ${session.id}`);
    }

    return this.attachPlayers(session);
  }

  /**
   * Registers a player into player 1 or player 2 slot
   */
  async joinPlayer(playerId: string, dto: JoinPlayerDto) {
    const session = await this.getOrCreateSession();

    if (
      session.status !== SessionStatus.WAITING &&
      session.status !== SessionStatus.LOGIN
    ) {
      throw new BadRequestException(
        'Cannot join session after match has started',
      );
    }

    const updateData: {
      player1Id?: string;
      player2Id?: string;
      status?: SessionStatus;
    } = {};

    if (dto.playerNumber === 1) {
      updateData.player1Id = playerId;
    } else {
      updateData.player2Id = playerId;
    }

    const hasP1 = updateData.player1Id || session.player1Id;
    const hasP2 = updateData.player2Id || session.player2Id;

    if (hasP1 && hasP2) {
      updateData.status = SessionStatus.READY;
    } else {
      updateData.status = SessionStatus.LOGIN;
    }

    const updatedSession = await this.prisma.gameSession.update({
      where: { id: session.id },
      data: updateData,
    });

    const sessionWithPlayers = await this.attachPlayers(updatedSession);
    this.broadcast.emit(SocketEvent.SESSION_UPDATE, sessionWithPlayers);

    if (hasP1 && hasP2) {
      this.broadcast.emit('game:waiting', { countdown: 5 });
      this.logger.log(`Both players joined. Starting 5s countdown before match start for session: ${session.id}`);
      
      setTimeout(async () => {
        try {
          const currentSession = await this.prisma.gameSession.findUnique({
            where: { id: session.id },
          });
          if (currentSession && currentSession.player1Id && currentSession.player2Id) {
            this.logger.log(`5s countdown complete. Starting match for session: ${session.id}`);
            await this.startMatch();
          } else {
            this.logger.log(`5s countdown complete but players left. Aborting match start for session: ${session.id}`);
          }
        } catch (err) {
          this.logger.error(`Failed to automatically start match: ${err.message}`);
        }
      }, 5000);
    }

    return sessionWithPlayers;
  }

  /**
   * Sets game difficulty for current session
   */
  async setDifficulty(dto: SelectDifficultyDto) {
    const session = await this.getOrCreateSession();

    const updateData: any = { difficulty: dto.difficulty };

    // If session was in finished/stale state, reset to WAITING upon difficulty selection
    if (
      session.status !== SessionStatus.WAITING &&
      session.status !== SessionStatus.LOGIN &&
      session.status !== SessionStatus.READY
    ) {
      updateData.status = SessionStatus.WAITING;
      updateData.currentRound = 1;
      updateData.player1Score = 0;
      updateData.player2Score = 0;
      updateData.currentSequence = null;
      updateData.player1Id = null;
      updateData.player2Id = null;
    }

    const updatedSession = await this.prisma.gameSession.update({
      where: { id: session.id },
      data: updateData,
    });

    const sessionWithPlayers = await this.attachPlayers(updatedSession);
    this.logger.log(`Difficulty updated to ${dto.difficulty} for session: ${session.id}`);
    this.broadcast.emit(SocketEvent.SESSION_UPDATE, sessionWithPlayers);
    return sessionWithPlayers;
  }

  /**
   * Starts the match
   */
  async startMatch() {
    const session = await this.getOrCreateSession();

    if (!session.player1Id || !session.player2Id) {
      throw new BadRequestException(
        'Two players must join before starting the match',
      );
    }

    const initialSequence = this.sequenceService.generateSequence(
      session.difficulty,
    );

    const updatedSession = await this.prisma.gameSession.update({
      where: { id: session.id },
      data: {
        status: SessionStatus.COUNTDOWN,
        currentRound: 1,
        player1Score: 0,
        player2Score: 0,
        currentSequence: initialSequence,
      },
    });

    const sessionWithPlayers = await this.attachPlayers(updatedSession);

    const startAt = Date.now() + 3000;
    this.broadcast.sequenceStartAt.set(session.id, startAt);
    this.broadcast.emit(SocketEvent.COUNTDOWN_START, {
      count: 3,
      startAt,
    });

    const displaySpeed =
      GAME_CONSTANTS.DISPLAY_SPEED_MS[session.difficulty] || 500;

    this.broadcast.emit(SocketEvent.SEQUENCE_SHOW, {
      sequence: initialSequence,
      displaySpeed,
      sessionId: session.id,
      round: 1,
      startAt,
      startInMs: 3000,
    });

    this.broadcast.emit(SocketEvent.SESSION_UPDATE, sessionWithPlayers);
    return sessionWithPlayers;
  }

  /**
   * Resets active session
   */
  async resetSession() {
    const session = await this.prisma.gameSession.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (session) {
      await this.prisma.gameSession.delete({
        where: { id: session.id },
      });
    }

    const newSession = await this.getOrCreateSession();
    this.broadcast.emit(SocketEvent.SYSTEM_RESET, { reset: true });
    this.broadcast.emit(SocketEvent.SESSION_UPDATE, newSession);

    return newSession;
  }
}
