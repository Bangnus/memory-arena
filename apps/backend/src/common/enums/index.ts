import { Difficulty, SessionStatus, Color } from '@prisma/client';

export { Difficulty, SessionStatus, Color };

export enum SocketEvent {
  SESSION_UPDATE = 'session:update',
  COUNTDOWN_START = 'countdown:start',
  SEQUENCE_SHOW = 'sequence:show',
  INPUT_ENABLED = 'input:enabled',
  PLAYER_PROGRESS = 'player:progress',
  ROUND_RESULT = 'round:result',
  MATCH_RESULT = 'match:result',
  LEADERBOARD_UPDATE = 'leaderboard:update',
  SYSTEM_RESET = 'system:reset',
}
