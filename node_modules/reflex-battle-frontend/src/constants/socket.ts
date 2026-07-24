export const SOCKET_EVENTS = {
  // Client to Server
  PLAYER_READY: 'player_ready',
  SUBMIT_SEQUENCE: 'submit_sequence',

  // Server to Client
  GAME_STARTED: 'game_started',
  COUNTDOWN: 'countdown',
  ROUND_STARTED: 'round_started',
  SHOW_SEQUENCE: 'show_sequence',
  INPUT_PHASE: 'input_phase',
  ROUND_RESULT: 'round_result',
  MATCH_RESULT: 'match_result',
  GAME_FINISHED: 'game_finished',
  SESSION_UPDATED: 'session_updated',
  ERROR: 'error',
  
  // Admin & Global
  SYSTEM_RESET: 'system_reset',
  LEADERBOARD_UPDATE: 'leaderboard_update',
} as const;
