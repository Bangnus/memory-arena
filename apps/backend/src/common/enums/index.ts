export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export enum SessionStatus {
  WAITING = 'WAITING',
  LOGIN = 'LOGIN',
  READY = 'READY',
  COUNTDOWN = 'COUNTDOWN',
  SHOW_SEQUENCE = 'SHOW_SEQUENCE',
  PLAYER_INPUT = 'PLAYER_INPUT',
  ROUND_RESULT = 'ROUND_RESULT',
  MATCH_RESULT = 'MATCH_RESULT',
  FINISHED = 'FINISHED',
}

export enum Color {
  RED = 'RED',
  GREEN = 'GREEN',
  BLUE = 'BLUE',
  YELLOW = 'YELLOW',
}

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
