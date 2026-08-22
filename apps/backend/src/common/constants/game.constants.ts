import { Difficulty, Color } from '../enums';

export const GAME_CONSTANTS = {
  MAX_WIN_POINTS: 3, // Best of 5 format (first to 3 points)
  COUNTDOWN_DURATION_MS: 3000,
  INPUT_TIMEOUT_MS: 15000,
  WINNER_SCREEN_DURATION_MS: 5000,
  SEQUENCE_LENGTH: {
    [Difficulty.EASY]: 4, // 2 + 2 levels harder
    [Difficulty.MEDIUM]: 5, // 3 + 2 levels harder
    [Difficulty.HARD]: 6, // 4 + 2 levels harder
  },
  DISPLAY_SPEED_MS: {
    [Difficulty.EASY]: 900,
    [Difficulty.MEDIUM]: 700,
    [Difficulty.HARD]: 500,
  },
  COLOR_MAP: [Color.RED, Color.GREEN, Color.BLUE, Color.YELLOW],
  COLOR_TO_INT: {
    [Color.RED]: 0,
    [Color.GREEN]: 1,
    [Color.BLUE]: 2,
    [Color.YELLOW]: 3,
  },
} as const;
