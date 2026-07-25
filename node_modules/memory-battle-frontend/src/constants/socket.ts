export const SOCKET_EVENTS = {
  // Client to Server
  PLAYER_READY: 'player_ready',
  SUBMIT_SEQUENCE: 'submit_sequence',

  // Server to Client
  SESSION_UPDATE: 'session:update',
  COUNTDOWN_START: 'countdown:start',
  SEQUENCE_SHOW: 'sequence:show',
  INPUT_ENABLED: 'input:enabled',
  ROUND_RESULT: 'round:result',
  MATCH_RESULT: 'match:result',
  GAME_FINISHED: 'game_finished',
  SYSTEM_RESET: 'system:reset',
  DEVICE_START: 'device:start',
  LEADERBOARD_UPDATE: 'leaderboard:update',
  PLAYER_PROGRESS: 'player:progress',
  ERROR: 'error',
} as const;
