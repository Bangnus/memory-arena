export const GAME_STATUS = {
  WAITING: 'WAITING',
  COUNTDOWN: 'COUNTDOWN',
  PLAYING: 'PLAYING',
  FINISHED: 'FINISHED',
} as const;

export const DIFFICULTY = {
  EASY: 'EASY',
  NORMAL: 'NORMAL',
  HARD: 'HARD',
} as const;

export const COLOR = {
  RED: 'RED',
  GREEN: 'GREEN',
  BLUE: 'BLUE',
  YELLOW: 'YELLOW',
} as const;

export const COLOR_MAP = {
  [COLOR.RED]: 'bg-red-500 shadow-red-500/50',
  [COLOR.GREEN]: 'bg-emerald-500 shadow-emerald-500/50',
  [COLOR.BLUE]: 'bg-blue-500 shadow-blue-500/50',
  [COLOR.YELLOW]: 'bg-amber-400 shadow-amber-400/50',
} as const;
