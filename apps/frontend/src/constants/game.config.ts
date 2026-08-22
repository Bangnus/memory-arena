export const DIFFICULTY_CONFIG = {
  EASY: {
    sequenceLength: 4,
    displaySpeed: 900,
    label: 'Easy',
  },
  MEDIUM: {
    sequenceLength: 5,
    displaySpeed: 700,
    label: 'Medium',
  },
  HARD: {
    sequenceLength: 6,
    displaySpeed: 500,
    label: 'Hard',
  },
} as const;

export const GAME_CONFIG = {
  MAX_ROUNDS: 3,
  COUNTDOWN_DURATION: 3,
  INPUT_TIMEOUT: 10000,
} as const;
