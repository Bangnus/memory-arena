#include "buzzer.h"

BuzzerManager buzzerManager;

void BuzzerManager::init() {
    // 10-bit resolution (0-1023) for finer duty cycle control
    ledcSetup(0, 2000, 10);
    ledcAttachPin(PIN_BUZZER, 0);
    digitalWrite(PIN_BUZZER, LOW);
}

void BuzzerManager::playTone(unsigned int frequency, unsigned long duration) {
    if (isMuted) return;
    ledcWriteTone(0, frequency);
    // Optimized 60% duty cycle for clean, pleasant and clear acoustic resonance
    ledcWrite(0, 614);
    currentToneStart = millis();
    currentToneDuration = duration;
}

void BuzzerManager::stopTone() {
    ledcWriteTone(0, 0);
    ledcWrite(0, 0);
}

void BuzzerManager::setMuted(bool mute) {
    isMuted = mute;
    if (isMuted) {
        stopTone();
        currentSound = BuzzerSound::NONE;
    }
}

bool BuzzerManager::isSoundMuted() const {
    return isMuted;
}

void BuzzerManager::playBoot() { play(BuzzerSound::BOOT); }
void BuzzerManager::playCountdown() { play(BuzzerSound::COUNTDOWN); }
void BuzzerManager::playButtonPress() { play(BuzzerSound::BUTTON_PRESS); }
void BuzzerManager::playInputReady() { play(BuzzerSound::INPUT_READY); }
void BuzzerManager::playGameStart() { play(BuzzerSound::GAME_START); }
void BuzzerManager::playCorrect() { play(BuzzerSound::CORRECT); }
void BuzzerManager::playWrong() { play(BuzzerSound::WRONG); }
void BuzzerManager::playWinner() { play(BuzzerSound::VICTORY); }
void BuzzerManager::playReset() { play(BuzzerSound::NONE); }
void BuzzerManager::stop() { play(BuzzerSound::NONE); }

void BuzzerManager::play(BuzzerSound sound) {
    if (isMuted && sound != BuzzerSound::NONE) return;
    currentSound = sound;
    melodyStep = 0;

    switch (sound) {
        case BuzzerSound::BOOT:
            // Soft warm boot ping
            playTone(988, 120);
            break;
        case BuzzerSound::BEEP:
            // Warm pleasant 2-note musical chime (1047 Hz -> 1319 Hz) for sequence color flash
            playTone(1047, 70);
            break;
        case BuzzerSound::COUNTDOWN:
            // Soft clean tick (784 Hz, 50 ms) for 3-2-1 countdown
            playTone(784, 50);
            break;
        case BuzzerSound::BUTTON_PRESS:
            // Single short tactile click when pressing button
            playTone(1760, 25);
            break;
        case BuzzerSound::INPUT_READY:
            currentSound = BuzzerSound::NONE;
            stopTone();
            break;
        case BuzzerSound::GAME_START:
            // Smooth rising 3-note game start fanfare (523 -> 659 -> 1047 Hz)
            playTone(523, 80);
            break;
        case BuzzerSound::CORRECT:
            // Crisp high chime for correct answer
            playTone(1319, 180);
            break;
        case BuzzerSound::WRONG:
            // Low soft error tone
            playTone(262, 350);
            break;
        case BuzzerSound::VICTORY:
            // Triumphant 3-note victory melody
            playTone(784, 150);
            break;
        case BuzzerSound::NONE:
        default:
            stopTone();
            break;
    }
}

void BuzzerManager::loop() {
    if (currentSound == BuzzerSound::NONE) return;

    unsigned long now = millis();
    if (currentToneDuration > 0 && now - currentToneStart >= currentToneDuration) {
        stopTone();
        currentToneDuration = 0;

        if (currentSound == BuzzerSound::VICTORY) {
            melodyStep++;
            if (melodyStep == 1) {
                playTone(1047, 150); // Step 2 (C6)
            } else if (melodyStep == 2) {
                playTone(1319, 350); // Step 3 (E6)
            } else {
                currentSound = BuzzerSound::NONE;
            }
        } else if (currentSound == BuzzerSound::BUTTON_PRESS) {
            currentSound = BuzzerSound::NONE;
        } else if (currentSound == BuzzerSound::BEEP) {
            melodyStep++;
            if (melodyStep == 1) {
                playTone(1319, 80); // Step 2 — warm harmonic finish
            } else {
                currentSound = BuzzerSound::NONE;
            }
        } else if (currentSound == BuzzerSound::GAME_START) {
            melodyStep++;
            if (melodyStep == 1) {
                playTone(659, 80);  // Step 2 (E5)
            } else if (melodyStep == 2) {
                playTone(1047, 140); // Step 3 (C6 — celebratory)
            } else {
                currentSound = BuzzerSound::NONE;
            }
        } else {
            currentSound = BuzzerSound::NONE;
        }
    }
}
