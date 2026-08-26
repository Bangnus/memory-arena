import { Difficulty, Color } from '../enums';

export const GAME_CONSTANTS = {
  MAX_WIN_POINTS: 2, // Best of 3 format (first to 2 points)
  COUNTDOWN_DURATION_MS: 3000,
  INPUT_TIMEOUT_MS: 15000,
  WINNER_SCREEN_DURATION_MS: 5000,
  SEQUENCE_LENGTH: {
    [Difficulty.EASY]: 3,
    [Difficulty.MEDIUM]: 4,
    [Difficulty.HARD]: 6,
  },
  DISPLAY_SPEED_MS: {
    [Difficulty.EASY]: 800,
    [Difficulty.MEDIUM]: 650,
    [Difficulty.HARD]: 450,
  },
  COLOR_MAP: [Color.RED, Color.GREEN, Color.BLUE, Color.YELLOW],
  COLOR_TO_INT: {
    [Color.RED]: 0,
    [Color.GREEN]: 1,
    [Color.BLUE]: 2,
    [Color.YELLOW]: 3,
  },
  LEADERBOARD: {
    WIN_POINTS: {
      [Difficulty.EASY]: 100,
      [Difficulty.MEDIUM]: 200,
      [Difficulty.HARD]: 300,
    },
    CLEAN_SWEEP_BONUS: 50,
    PARTICIPATION_POINTS: 20,
  },
} as const;
