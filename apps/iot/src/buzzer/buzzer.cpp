#include "buzzer.h"

BuzzerManager buzzerManager;

void BuzzerManager::init() {
    // 10-bit resolution (0-1023) for finer duty cycle control
    ledcSetup(0, 2000, 10);
    ledcAttachPin(PIN_BUZZER, 0);
    digitalWrite(PIN_BUZZER, LOW);
}

void BuzzerManager::playTone(unsigned int frequency, unsigned long duration) {
    ledcWriteTone(0, frequency);
    // Set 80% duty cycle for louder sound (max is 1023 for 10-bit)
    ledcWrite(0, 819);
    currentToneStart = millis();
    currentToneDuration = duration;
}

void BuzzerManager::stopTone() {
    ledcWriteTone(0, 0);
    ledcWrite(0, 0);
}

void BuzzerManager::playBoot() { play(BuzzerSound::BOOT); }
void BuzzerManager::playCountdown() { play(BuzzerSound::BEEP); }
void BuzzerManager::playButtonPress() { play(BuzzerSound::BUTTON_PRESS); }
void BuzzerManager::playCorrect() { play(BuzzerSound::CORRECT); }
void BuzzerManager::playWrong() { play(BuzzerSound::WRONG); }
void BuzzerManager::playWinner() { play(BuzzerSound::VICTORY); }
void BuzzerManager::playReset() { play(BuzzerSound::NONE); }

void BuzzerManager::play(BuzzerSound sound) {
    currentSound = sound;
    melodyStep = 0;

    switch (sound) {
        case BuzzerSound::BOOT:
            playTone(1000, 150);
            break;
        case BuzzerSound::BEEP:
            playTone(800, 150);
            break;
        case BuzzerSound::BUTTON_PRESS:
            // Two quick high-pitched clicks — very different from BEEP
            playTone(3000, 30);
            break;
        case BuzzerSound::CORRECT:
            playTone(1200, 200);
            break;
        case BuzzerSound::WRONG:
            playTone(300, 500);
            break;
        case BuzzerSound::VICTORY:
            playTone(1000, 200);
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
                playTone(1200, 200);
            } else if (melodyStep == 2) {
                playTone(1500, 400);
            } else {
                currentSound = BuzzerSound::NONE;
            }
        } else if (currentSound == BuzzerSound::BUTTON_PRESS) {
            melodyStep++;
            if (melodyStep == 1) {
                playTone(2500, 25); // Second quick click
            } else {
                currentSound = BuzzerSound::NONE;
            }
        } else {
            currentSound = BuzzerSound::NONE;
        }
    }
}
