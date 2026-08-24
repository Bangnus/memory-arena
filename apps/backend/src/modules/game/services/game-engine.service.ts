import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { BroadcastService } from '../../socket/broadcast.service';
import { SequenceService } from './sequence.service';
import { ValidatorService } from './validator.service';
import { ScoringService } from './scoring.service';
import { StateMachineService } from './state-machine.service';
import { SubmitInputDto } from '../dto/submit-input.dto';
import { Color, SessionStatus, SocketEvent, Difficulty } from '../../../common/enums';
import { GAME_CONSTANTS } from '../../../common/constants/game.constants';

@Injectable()
export class GameEngineService {
  private readonly logger = new Logger(GameEngineService.name);
  // Tracks the scheduled start time for each session's sequence display
  // Shared sequence start times stored in BroadcastService

  constructor(
    private readonly prisma: PrismaService,
    private readonly broadcast: BroadcastService,
    private readonly sequenceService: SequenceService,
    private readonly validatorService: ValidatorService,
    private readonly scoringService: ScoringService,
    private readonly stateMachineService: StateMachineService,
  ) {}

  /**
   * Retrieves active session details or throws 404
   */
  async getCurrentSession() {
    const session = await this.prisma.gameSession.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!session) {
      throw new NotFoundException('No active game session found');
    }

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
   * Gets current sequence for active session (used by ESP32)
   */
  async getCurrentSequence() {
    const session = await this.getCurrentSession();

    let sequence = session.currentSequence as Color[];

    if (!sequence || sequence.length === 0) {
      sequence = this.sequenceService.generateSequence(session.difficulty as Difficulty);
      await this.prisma.gameSession.update({
        where: { id: session.id },
        data: {
          currentSequence: sequence,
          status: SessionStatus.SHOW_SEQUENCE,
        },
      });
    }

    const displaySpeed =
      GAME_CONSTANTS.DISPLAY_SPEED_MS[session.difficulty as Difficulty] || 500;

    const sessionWithPlayers = await this.getCurrentSession();
    this.broadcast.emit(SocketEvent.SESSION_UPDATE, sessionWithPlayers);

    // Calculate synchronized start time
    const countdownDuration = GAME_CONSTANTS.COUNTDOWN_DURATION_MS;
    const startAt = Date.now() + countdownDuration;
    this.broadcast.sequenceStartAt.set(session.id, startAt);
    this.logger.log(`[DEBUG][BACKEND] countdown duration=${countdownDuration}ms, calculated startAt=${startAt} (in ${startAt - Date.now()}ms)`);

    // Emit countdown + sequence events for frontend synchronization
    this.broadcast.emit(SocketEvent.COUNTDOWN_START, { count: 3, startAt });
    this.broadcast.emit(SocketEvent.SEQUENCE_SHOW, {
      sequence,
      displaySpeed,
      sessionId: session.id,
      round: session.currentRound,
      startAt,
    });

    // Schedule input:enabled after sequence display finishes
    const displayDuration = sequence.length * displaySpeed;
    const inputEnabledAt = startAt + displayDuration;
    const delayMs = Math.max(0, inputEnabledAt - Date.now());
    this.logger.log(`[DEBUG][BACKEND] Scheduling input:enabled in ${delayMs}ms (display=${displayDuration}ms) at inputEnabledAt=${inputEnabledAt}`);
    setTimeout(() => {
      this.broadcast.emit(SocketEvent.INPUT_ENABLED, {});
      this.logger.log('input:enabled emitted');
    }, delayMs);

    return {
      sequence,
      displaySpeed,
      sessionId: session.id,
      round: session.currentRound,
      startAt,
    };
  }

  /**
   * Processes player inputs from ESP32 or unified API
   */
  async processRoundInput(dto: SubmitInputDto) {
    const session = await this.prisma.gameSession.findUnique({
      where: { id: dto.sessionId },
    });

    if (!session) {
      throw new NotFoundException(
        `GameSession with ID ${dto.sessionId} not found`,
      );
    }

    const targetSequence = (session.currentSequence as Color[]) || [];

    if (targetSequence.length === 0) {
      throw new BadRequestException('Current session has no active sequence');
    }

    // 1. Validate inputs
    const p1Val = this.validatorService.validateInput(
      targetSequence,
      dto.player1.input,
    );
    const p2Val = this.validatorService.validateInput(
      targetSequence,
      dto.player2.input,
    );

    // 2. Evaluate round winner
    const evalResult = this.scoringService.evaluateRound({
      player1Correct: p1Val.isCorrect,
      player1Time: dto.player1.time,
      player2Correct: p2Val.isCorrect,
      player2Time: dto.player2.time,
    });

    let newP1Score = session.player1Score;
    let newP2Score = session.player2Score;

    if (evalResult.winnerPlayerNumber === 1) {
      newP1Score += 1;
    } else if (evalResult.winnerPlayerNumber === 2) {
      newP2Score += 1;
    }

    // 3. Check for match winner
    const matchWinnerNumber = this.scoringService.checkMatchWinner(
      newP1Score,
      newP2Score,
    );
    const isMatchFinished = matchWinnerNumber !== null;

    // Generate next sequence
    const nextSequence = this.sequenceService.generateSequence(
      session.difficulty as Difficulty,
    );
    const displaySpeed =
      GAME_CONSTANTS.DISPLAY_SPEED_MS[session.difficulty as Difficulty];

    if (isMatchFinished) {
      // Determine winner player ID
      const winnerId =
        matchWinnerNumber === 1 ? session.player1Id : session.player2Id;

      // Complete match inside database transaction
      await this.prisma.$transaction(async (tx) => {
        const match = await tx.match.create({
          data: {
            difficulty: session.difficulty,
            winnerId: winnerId || null,
            durationMs: 0,
            player1Score: newP1Score,
            player2Score: newP2Score,
            startedAt: session.createdAt,
            finishedAt: new Date(),
          },
        });

        if (session.player1Id) {
          await tx.matchPlayer.create({
            data: {
              matchId: match.id,
              playerId: session.player1Id,
              playerNumber: 1,
            },
          });
        }

        if (session.player2Id) {
          await tx.matchPlayer.create({
            data: {
              matchId: match.id,
              playerId: session.player2Id,
              playerNumber: 2,
            },
          });
        }

        await tx.round.create({
          data: {
            matchId: match.id,
            roundNumber: dto.round,
            sequence: targetSequence,
            player1Input: dto.player1.input,
            player2Input: dto.player2.input,
            player1Time: dto.player1.time,
            player2Time: dto.player2.time,
            winnerPlayerNumber: evalResult.winnerPlayerNumber,
            player1Correct: p1Val.isCorrect,
            player2Correct: p2Val.isCorrect,
          },
        });

        await tx.gameSession.delete({
          where: { id: session.id },
        });
      });

      this.broadcast.emit(SocketEvent.MATCH_RESULT, {
        winnerPlayerNumber: matchWinnerNumber,
        winnerId,
        player1Score: newP1Score,
        player2Score: newP2Score,
      });

      this.broadcast.emit(SocketEvent.LEADERBOARD_UPDATE, { updated: true });

      return {
        winner: evalResult.winnerPlayerNumber,
        player1Score: newP1Score,
        player2Score: newP2Score,
        matchFinished: true,
        nextRound: null,
        nextSequence: [],
        displaySpeed,
      };
    } else {
      // Advance to next round
      const nextRoundNumber = evalResult.shouldRestartRound
        ? session.currentRound
        : session.currentRound + 1;

      const updatedSession = await this.prisma.gameSession.update({
        where: { id: session.id },
        data: {
          player1Score: newP1Score,
          player2Score: newP2Score,
          currentRound: nextRoundNumber,
          currentSequence: nextSequence,
          status: SessionStatus.SHOW_SEQUENCE,
        },
      });

      // Emit countdown + sequence events for next round synchronization
      const countdownDuration = GAME_CONSTANTS.COUNTDOWN_DURATION_MS;
      const nextStartAt = Date.now() + countdownDuration;
      this.broadcast.sequenceStartAt.set(session.id, nextStartAt);

      const sessionWithPlayers = await this.getCurrentSession();

      this.broadcast.emit(SocketEvent.ROUND_RESULT, {
        round: dto.round,
        winnerPlayerNumber: evalResult.winnerPlayerNumber,
        player1Score: newP1Score,
        player2Score: newP2Score,
        shouldRestart: evalResult.shouldRestartRound,
        nextRound: nextRoundNumber,
      });

      this.broadcast.emit(SocketEvent.COUNTDOWN_START, { count: 3, startAt: nextStartAt });
      this.broadcast.emit(SocketEvent.SEQUENCE_SHOW, {
        sequence: nextSequence,
        displaySpeed: GAME_CONSTANTS.DISPLAY_SPEED_MS[session.difficulty],
        sessionId: session.id,
        round: nextRoundNumber,
        startAt: nextStartAt,
      });

      this.broadcast.emit(SocketEvent.SESSION_UPDATE, sessionWithPlayers);

      return {
        winner: evalResult.winnerPlayerNumber,
        player1Score: newP1Score,
        player2Score: newP2Score,
        matchFinished: false,
        nextRound: nextRoundNumber,
        nextSequence,
        displaySpeed,
      };
    }
  }

  broadcastPress(playerNumber: number, color: string) {
    this.broadcast.emit(SocketEvent.PLAYER_PROGRESS, { playerNumber, color });
    return { success: true };
  }
}
