import { Injectable, BadRequestException } from '@nestjs/common';
import { SessionStatus } from '../../../common/enums';

@Injectable()
export class StateMachineService {
  private readonly validTransitions: Record<SessionStatus, SessionStatus[]> = {
    [SessionStatus.WAITING]: [SessionStatus.LOGIN],
    [SessionStatus.LOGIN]: [SessionStatus.READY, SessionStatus.WAITING],
    [SessionStatus.READY]: [SessionStatus.COUNTDOWN, SessionStatus.WAITING],
    [SessionStatus.COUNTDOWN]: [
      SessionStatus.SHOW_SEQUENCE,
      SessionStatus.WAITING,
    ],
    [SessionStatus.SHOW_SEQUENCE]: [
      SessionStatus.PLAYER_INPUT,
      SessionStatus.WAITING,
    ],
    [SessionStatus.PLAYER_INPUT]: [
      SessionStatus.ROUND_RESULT,
      SessionStatus.WAITING,
    ],
    [SessionStatus.ROUND_RESULT]: [
      SessionStatus.SHOW_SEQUENCE,
      SessionStatus.MATCH_RESULT,
      SessionStatus.WAITING,
    ],
    [SessionStatus.MATCH_RESULT]: [
      SessionStatus.FINISHED,
      SessionStatus.WAITING,
    ],
    [SessionStatus.FINISHED]: [SessionStatus.WAITING],
  };

  validateTransition(
    currentStatus: SessionStatus,
    nextStatus: SessionStatus,
  ): boolean {
    const allowed = this.validTransitions[currentStatus] || [];
    if (!allowed.includes(nextStatus)) {
      throw new BadRequestException(
        `Invalid game state transition from ${currentStatus} to ${nextStatus}`,
      );
    }
    return true;
  }
}
