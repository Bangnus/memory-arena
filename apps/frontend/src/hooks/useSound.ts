'use client';

import { useCallback, useRef } from 'react';

export type SoundType = 'beep' | 'buttonPress' | 'correct' | 'wrong' | 'victory' | 'countdown';

// Sound frequencies matching ESP32 buzzer tones
const SOUND_CONFIG: Record<SoundType, { frequency: number; duration: number; type?: OscillatorType }> = {
  beep: { frequency: 800, duration: 50 },
  buttonPress: { frequency: 2000, duration: 15 },
  correct: { frequency: 1200, duration: 80 },
  wrong: { frequency: 300, duration: 500 },
  victory: { frequency: 1000, duration: 150 },
  countdown: { frequency: 800, duration: 50 },
};

export function useSound() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    return audioCtxRef.current;
  }, []);

  const playSound = useCallback((type: SoundType) => {
    try {
      const ctx = getAudioContext();
      const config = SOUND_CONFIG[type];
      
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = config.frequency;
      oscillator.type = (config.type || 'sine') as OscillatorType;
      
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + config.duration / 1000);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + config.duration / 1000);
    } catch {
      // Audio context not available or blocked
    }
  }, [getAudioContext]);

  const playCountdownBeep = useCallback((count: number) => {
    if (count > 0) {
      playSound('countdown');
    } else {
      playSound('correct');
    }
  }, [playSound]);

  const playSequenceBeep = useCallback(() => {
    playSound('beep');
  }, [playSound]);

  const playButtonPress = useCallback(() => {
    playSound('buttonPress');
  }, [playSound]);

  const playCorrect = useCallback(() => {
    playSound('correct');
  }, [playSound]);

  const playWrong = useCallback(() => {
    playSound('wrong');
  }, [playSound]);

  const playVictory = useCallback(() => {
    playSound('victory');
  }, [playSound]);

  return {
    playSound,
    playCountdownBeep,
    playSequenceBeep,
    playButtonPress,
    playCorrect,
    playWrong,
    playVictory,
  };
}
