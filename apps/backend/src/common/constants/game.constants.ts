import { Difficulty, Color } from '../enums';

export const GAME_CONSTANTS = {
  MAX_WIN_POINTS: 2, // Best of 3 format (first to 2 points)
  COUNTDOWN_DURATION_MS: 3000,
  INPUT_TIMEOUT_MS: 15000,
  WINNER_SCREEN_DURATION_MS: 5000,
  SEQUENCE_LENGTH: {
    [Difficulty.EASY]: 2,
    [Difficulty.MEDIUM]: 3,
    [Difficulty.HARD]: 4,
  },
  DISPLAY_SPEED_MS: {
    [Difficulty.EASY]: 1000,
    [Difficulty.MEDIUM]: 750,
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
