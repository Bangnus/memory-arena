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
    // Set 45% duty cycle for clear, crisp, and non-piercing 8-bit arcade sound
    ledcWrite(0, 460);
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

struct MelodyNote {
    uint16_t freq;
    uint16_t duration;
    uint16_t pause;
};

// Classic Super Mario 8-bit Arcade Theme (Smoothed & balanced, no harsh high beeps)
static const MelodyNote STANDBY_THEME_NOTES[] = {
    // Intro Fanfare
    {659, 100, 50},  // E5
    {659, 100, 120}, // E5
    {659, 100, 120}, // E5
    {523, 100, 50},  // C5
    {659, 100, 120}, // E5
    {784, 150, 150}, // G5
    {392, 180, 250}, // G4

    // Main Catchy Groove
    {523, 140, 60},  // C5
    {392, 140, 60},  // G4
    {330, 140, 100}, // E4
    {440, 120, 50},  // A4
    {494, 120, 50},  // B4
    {466, 120, 50},  // Bb4
    {440, 150, 100}, // A4

    // Response Phrase (Smoothed mid-range, no 880Hz spike)
    {392, 120, 50},  // G4
    {659, 120, 50},  // E5
    {784, 130, 60},  // G5
    {698, 120, 50},  // F5
    {659, 140, 80},  // E5
    {523, 120, 50},  // C5
    {587, 120, 50},  // D5
    {494, 180, 800}  // B4 (gentle pause before loop repeats)
};

static const int STANDBY_THEME_LEN = sizeof(STANDBY_THEME_NOTES) / sizeof(MelodyNote);

void BuzzerManager::playBoot() { play(BuzzerSound::BOOT); }
void BuzzerManager::playCountdown() { play(BuzzerSound::COUNTDOWN); }
void BuzzerManager::playButtonPress() { play(BuzzerSound::BUTTON_PRESS); }
void BuzzerManager::playInputReady() { play(BuzzerSound::INPUT_READY); }
void BuzzerManager::playGameStart() { play(BuzzerSound::GAME_START); }
void BuzzerManager::playCorrect() { play(BuzzerSound::CORRECT); }
void BuzzerManager::playWrong() { play(BuzzerSound::WRONG); }
void BuzzerManager::playWinner() { play(BuzzerSound::VICTORY); }
void BuzzerManager::playReset() { play(BuzzerSound::NONE); }
void BuzzerManager::playStandbyTheme() { play(BuzzerSound::STANDBY_THEME); }
void BuzzerManager::stop() { play(BuzzerSound::NONE); }

void BuzzerManager::play(BuzzerSound sound) {
    currentSound = sound;
    melodyStep = 0;
    notePauseUntil = 0;

    switch (sound) {
        case BuzzerSound::BOOT:
            playTone(1000, 150);
            break;
        case BuzzerSound::BEEP:
            // Warm pleasant 2-note musical chime (1000 Hz -> 1300 Hz) for sequence color flash
            playTone(1000, 70);
            break;
        case BuzzerSound::COUNTDOWN:
            // Soft clean tick (750 Hz, 50 ms) for 3-2-1 countdown
            playTone(750, 50);
            break;
        case BuzzerSound::BUTTON_PRESS:
            // Single short click when pressing button
            playTone(2000, 20);
            break;
        case BuzzerSound::INPUT_READY:
            currentSound = BuzzerSound::NONE;
            stopTone();
            break;
        case BuzzerSound::GAME_START:
            // Rising 3-note game start fanfare
            playTone(600, 80);
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
        case BuzzerSound::STANDBY_THEME:
            playTone(STANDBY_THEME_NOTES[0].freq, STANDBY_THEME_NOTES[0].duration);
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

    // Handle tone duration and note stopping
    if (currentToneDuration > 0 && now - currentToneStart >= currentToneDuration) {
        stopTone();
        currentToneDuration = 0;

        if (currentSound == BuzzerSound::STANDBY_THEME) {
            notePauseUntil = now + STANDBY_THEME_NOTES[melodyStep].pause;
        } else if (currentSound == BuzzerSound::VICTORY) {
            melodyStep++;
            if (melodyStep == 1) {
                playTone(1200, 200);
            } else if (melodyStep == 2) {
                playTone(1500, 400);
            } else {
                currentSound = BuzzerSound::NONE;
            }
        } else if (currentSound == BuzzerSound::BUTTON_PRESS) {
            currentSound = BuzzerSound::NONE;
        } else if (currentSound == BuzzerSound::BEEP) {
            melodyStep++;
            if (melodyStep == 1) {
                playTone(1300, 90); // Note 2 — warm mid-range finish
            } else {
                currentSound = BuzzerSound::NONE;
            }
        } else if (currentSound == BuzzerSound::GAME_START) {
            melodyStep++;
            if (melodyStep == 1) {
                playTone(800, 80); // Note 2 — rising
            } else if (melodyStep == 2) {
                playTone(1200, 120); // Note 3 — highest, longer
            } else {
                currentSound = BuzzerSound::NONE;
            }
        } else {
            currentSound = BuzzerSound::NONE;
        }
    }

    // Handle standby theme looping with pauses between notes
    if (currentSound == BuzzerSound::STANDBY_THEME && currentToneDuration == 0) {
        if (now >= notePauseUntil) {
            melodyStep = (melodyStep + 1) % STANDBY_THEME_LEN;
            const MelodyNote& note = STANDBY_THEME_NOTES[melodyStep];
            playTone(note.freq, note.duration);
        }
    }
}
