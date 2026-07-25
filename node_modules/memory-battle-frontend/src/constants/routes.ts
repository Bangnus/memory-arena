export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  GAME: '/game',
  LEADERBOARD: '/leaderboard',
  HISTORY: '/history',
  ADMIN: '/admin',
} as const;

export const API_ROUTES = {
  AUTH: {
    LINE_LOGIN: '/auth/line',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
  },
  GAME: {
    SESSION: '/game/session',
    START: '/game/start',
    SEQUENCE: '/game/sequence',
    INPUT: '/game/input',
    STATUS: '/game/status',
  },
  LEADERBOARD: '/leaderboard',
  HISTORY: '/history',
  ADMIN: {
    RESET: '/admin/reset',
    STATS: '/admin/stats',
  },
} as const;
