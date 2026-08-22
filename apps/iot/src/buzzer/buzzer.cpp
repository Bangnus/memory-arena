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
    // Set 35% duty cycle for mellow, warm and non-piercing acoustic sound
    ledcWrite(0, 358);
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

// Warm & Smooth 8-bit Tetris Lo-Fi Melody (Lower Octave 3-4: 220-330Hz, zero harsh beeps)
static const MelodyNote STANDBY_THEME_NOTES[] = {
    {330, 240, 60},  // E4 (warm, low)
    {247, 130, 40},  // B3
    {262, 150, 40},  // C4
    {294, 240, 60},  // D4
    {262, 150, 40},  // C4
    {247, 150, 40},  // B3
    {220, 260, 60},  // A3 (deep, soft)
    {262, 150, 40},  // C4
    {330, 260, 60},  // E4
    {294, 150, 40},  // D4
    {262, 150, 40},  // C4
    {247, 280, 80},  // B3
    {262, 150, 40},  // C4
    {294, 260, 60},  // D4
    {330, 280, 60},  // E4
    {262, 240, 50},  // C4
    {220, 260, 60},  // A3
    {220, 380, 800}  // A3 (gentle deep finish before peaceful loop)
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
