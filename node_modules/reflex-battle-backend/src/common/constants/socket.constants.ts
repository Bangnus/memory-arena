export const SOCKET_CONSTANTS = {
  CORS_ORIGIN: process.env.FRONTEND_URL || 'http://localhost:3000',
  NAMESPACE: '/',
  CONNECTION_TIMEOUT: 30000,
  PING_INTERVAL: 25000,
  PING_TIMEOUT: 20000,
} as const;

export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECTION: 'connection',

  // Session
  SESSION_UPDATE: 'session:update',
  JOIN_SESSION: 'join:session',
  LEAVE_SESSION: 'leave:session',

  // Game Flow
  COUNTDOWN_START: 'countdown:start',
  COUNTDOWN_TICK: 'countdown:tick',
  SEQUENCE_SHOW: 'sequence:show',
  INPUT_ENABLED: 'input:enabled',
  PLAYER_PROGRESS: 'player:progress',

  // Round
  ROUND_RESULT: 'round:result',
  ROUND_START: 'round:start',

  // Match
  MATCH_RESULT: 'match:result',
  MATCH_START: 'match:start',

  // Player
  PLAYER_READY: 'player:ready',
  PLAYER_JOIN: 'player:join',
  PLAYER_LEAVE: 'player:leave',

  // Leaderboard
  LEADERBOARD_UPDATE: 'leaderboard:update',

  // Admin
  SYSTEM_RESET: 'system:reset',
  ADMIN_ACTION: 'admin:action',

  // Error
  ERROR: 'error',
} as const;
