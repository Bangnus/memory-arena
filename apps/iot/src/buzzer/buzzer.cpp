#include "buzzer.h"

BuzzerManager buzzerManager;

void BuzzerManager::init() {
    ledcSetup(0, 2000, 8);
    ledcAttachPin(PIN_BUZZER, 0);
    digitalWrite(PIN_BUZZER, LOW);
}

void BuzzerManager::playTone(unsigned int frequency, unsigned long duration) {
    ledcWriteTone(0, frequency);
    currentToneStart = millis();
    currentToneDuration = duration;
}

void BuzzerManager::stopTone() {
    ledcWriteTone(0, 0);
}

void BuzzerManager::playBoot() { play(BuzzerSound::BOOT); }
void BuzzerManager::playCountdown() { play(BuzzerSound::BEEP); }
void BuzzerManager::playCorrect() { play(BuzzerSound::CORRECT); }
void BuzzerManager::playWrong() { play(BuzzerSound::WRONG); }
void BuzzerManager::playWinner() { play(BuzzerSound::VICTORY); }
void BuzzerManager::playReset() { play(BuzzerSound::NONE); }

void BuzzerManager::play(BuzzerSound sound) {
    currentSound = sound;
    melodyStep = 0;

    switch (sound) {
        case BuzzerSound::BOOT:
            playTone(1000, 100);
            break;
        case BuzzerSound::BEEP:
            playTone(800, 100);
            break;
        case BuzzerSound::CORRECT:
            playTone(1200, 200);
            break;
        case BuzzerSound::WRONG:
            playTone(300, 500);
            break;
        case BuzzerSound::VICTORY:
            playTone(1000, 150);
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
                playTone(1200, 150);
            } else if (melodyStep == 2) {
                playTone(1500, 300);
            } else {
                currentSound = BuzzerSound::NONE;
            }
        } else {
            currentSound = BuzzerSound::NONE;
        }
    }
}
