'use client';

import { useCallback, useRef } from 'react';

export type SoundType = 'beep' | 'buttonPress' | 'inputReady' | 'gameStart' | 'correct' | 'wrong' | 'victory' | 'countdown';

// Sound frequencies matching ESP32 buzzer tones
const SOUND_CONFIG: Record<SoundType, { frequency: number; duration: number; type?: OscillatorType }> = {
  beep: { frequency: 800, duration: 150 },
  buttonPress: { frequency: 2000, duration: 20 },
  inputReady: { frequency: 3000, duration: 50 },
  gameStart: { frequency: 600, duration: 80 }, // First note of rising fanfare
  correct: { frequency: 1200, duration: 200 },
  wrong: { frequency: 300, duration: 500 },
  victory: { frequency: 1000, duration: 200 },
  countdown: { frequency: 800, duration: 150 },
};

export function useSound() {
  // Web audio disabled: Sound is produced solely by IoT ESP32 hardware buzzer
  const playSound = useCallback((_type: SoundType) => {}, []);
  const playCountdownBeep = useCallback((_count: number) => {}, []);
  const playSequenceBeep = useCallback(() => {}, []);
  const playButtonPress = useCallback(() => {}, []);
  const playInputReady = useCallback(() => {}, []);
  const playGameStart = useCallback(() => {}, []);
  const playCorrect = useCallback(() => {}, []);
  const playWrong = useCallback(() => {}, []);
  const playVictory = useCallback(() => {}, []);

  return {
    playSound,
    playCountdownBeep,
    playSequenceBeep,
    playButtonPress,
    playInputReady,
    playGameStart,
    playCorrect,
    playWrong,
    playVictory,
  };
}
