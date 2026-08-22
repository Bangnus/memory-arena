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
    // Optimized 50% duty cycle for clean, pleasant acoustic resonance
    ledcWrite(0, 512);
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
        currentToneDuration = 0;
        notePauseUntil = 0;
        melodyStep = 0;
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

// Pokemon Center Theme (Warm, Relaxing & Classic Game Melody - Perfect for Standby)
static const MelodyNote STANDBY_THEME_NOTES[] = {
    // Phrase 1: Main Theme Melody
    {523, 160, 60},  // C5
    {494, 160, 60},  // B4
    {523, 160, 60},  // C5
    {392, 280, 100}, // G4
    {349, 160, 60},  // F4
    {392, 160, 60},  // G4
    {440, 200, 80},  // A4
    {392, 350, 150}, // G4

    // Phrase 2: Echo
    {523, 160, 60},  // C5
    {494, 160, 60},  // B4
    {523, 160, 60},  // C5
    {392, 280, 100}, // G4
    {330, 160, 60},  // E4
    {349, 160, 60},  // F4
    {392, 350, 150}, // G4

    // Phrase 3: Peaceful Cadence
    {440, 160, 60},  // A4
    {392, 160, 60},  // G4
    {349, 160, 60},  // F4
    {330, 200, 80},  // E4
    {294, 160, 60},  // D4
    {330, 160, 60},  // E4
    {349, 160, 60},  // F4
    {392, 250, 100}, // G4

    // Phrase 4: Warm Resolution
    {523, 200, 80},  // C5
    {392, 200, 80},  // G4
    {330, 200, 80},  // E4
    {294, 250, 100}, // D4
    {262, 500, 1200} // C4 (warm gentle finish with 1.2s peaceful pause before loop)
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
    if (isMuted && sound != BuzzerSound::NONE) return;
    currentSound = sound;
    melodyStep = 0;
    notePauseUntil = 0;

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
    if (isMuted || currentSound == BuzzerSound::NONE) return;

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

    // Handle standby ambient theme looping with gentle pauses
    if (currentSound == BuzzerSound::STANDBY_THEME && currentToneDuration == 0) {
        if (now >= notePauseUntil) {
            melodyStep = (melodyStep + 1) % STANDBY_THEME_LEN;
            const MelodyNote& note = STANDBY_THEME_NOTES[melodyStep];
            playTone(note.freq, note.duration);
        }
    }
}
