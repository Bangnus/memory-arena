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
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
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
      
      gainNode.gain.setValueAtTime(1.0, ctx.currentTime);
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

  const playInputReady = useCallback(() => {
    try {
      const ctx = getAudioContext();
      // Rising two-tone fanfare: low then high
      const tones = [
        { freq: 600, start: 0, dur: 0.15 },
        { freq: 1200, start: 0.15, dur: 0.4 },
      ];
      tones.forEach(({ freq, start, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(1.0, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + start + dur);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + dur);
      });
    } catch {}
  }, [getAudioContext]);

  const playGameStart = useCallback(() => {
    playSound('gameStart');
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
    playInputReady,
    playGameStart,
    playCorrect,
    playWrong,
    playVictory,
  };
}
