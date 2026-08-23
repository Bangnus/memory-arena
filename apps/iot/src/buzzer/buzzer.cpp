#include "buzzer.h"

BuzzerManager buzzerManager;

void BuzzerManager::init() {
    // 10-bit resolution (0-1023) for finer duty cycle control
    ledcSetup(0, 2000, 10);
    ledcAttachPin(PIN_BUZZER, 0);
    digitalWrite(PIN_BUZZER, LOW);
}

void BuzzerManager::playTone(unsigned int frequency, unsigned long duration, uint32_t dutyCycle) {
    ledcWriteTone(0, frequency);
    ledcWrite(0, dutyCycle);
    currentToneStart = millis();
    currentToneDuration = duration;
}

void BuzzerManager::stopTone() {
    ledcWriteTone(0, 0);
    ledcWrite(0, 0);
}

void BuzzerManager::setMuted(bool mute) {
    setSoundConfig(!mute, !mute);
}

void BuzzerManager::setBgmMuted(bool mute) {
    isBgmMuted = mute;
    if (isBgmMuted && currentSound == BuzzerSound::STANDBY_THEME) {
        stopTone();
        currentSound = BuzzerSound::NONE;
        currentToneDuration = 0;
        notePauseUntil = 0;
        melodyStep = 0;
    }
}

void BuzzerManager::setSfxMuted(bool mute) {
    isSfxMuted = mute;
    if (isSfxMuted && currentSound != BuzzerSound::STANDBY_THEME) {
        stopTone();
        currentSound = BuzzerSound::NONE;
        currentToneDuration = 0;
        notePauseUntil = 0;
        melodyStep = 0;
    }
}

void BuzzerManager::setSoundConfig(bool bgmEnabled, bool sfxEnabled) {
    setBgmMuted(!bgmEnabled);
    setSfxMuted(!sfxEnabled);
}

bool BuzzerManager::isBgmMutedState() const {
    return isBgmMuted;
}

bool BuzzerManager::isSfxMutedState() const {
    return isSfxMuted;
}

bool BuzzerManager::isSoundMuted() const {
    return isBgmMuted && isSfxMuted;
}

struct MelodyNote {
    uint16_t freq;
    uint16_t duration;
    uint16_t pause;
};

// Pokemon Center Theme - Soft gentle background volume (duty cycle 180)
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
void BuzzerManager::playReset() { play(BuzzerSound::RESET); }
void BuzzerManager::playStandbyTheme() { play(BuzzerSound::STANDBY_THEME); }
void BuzzerManager::stop() { play(BuzzerSound::NONE); }

void BuzzerManager::play(BuzzerSound sound) {
    if (sound == BuzzerSound::STANDBY_THEME && isBgmMuted) return;
    if (sound != BuzzerSound::STANDBY_THEME && sound != BuzzerSound::NONE && isSfxMuted) return;

    currentSound = sound;
    melodyStep = 0;
    notePauseUntil = 0;

    switch (sound) {
        case BuzzerSound::BOOT:
            // Soft boot ping (duty 750)
            playTone(988, 120, 750);
            break;
        case BuzzerSound::BEEP:
            // Loud & clear 2-note musical chime for sequence color flash (duty 840)
            playTone(1047, 80, 840);
            break;
        case BuzzerSound::COUNTDOWN:
            // Punchy tick (duty 850) for 3-2-1 countdown
            playTone(784, 60, 850);
            break;
        case BuzzerSound::BUTTON_PRESS:
            // High-impact loud click when pressing button (duty 870)
            playTone(1760, 35, 870);
            break;
        case BuzzerSound::INPUT_READY:
            currentSound = BuzzerSound::NONE;
            stopTone();
            break;
        case BuzzerSound::GAME_START:
            // Loud, energetic rising 3-note game start fanfare (duty 860)
            playTone(523, 100, 860);
            break;
        case BuzzerSound::CORRECT:
            // Loud celebratory chime for correct answer (duty 870)
            playTone(1319, 200, 870);
            break;
        case BuzzerSound::WRONG:
            // Low loud error buzz (duty 820)
            playTone(262, 400, 820);
            break;
        case BuzzerSound::VICTORY:
            // Grand triumphant victory fanfare (duty 880)
            playTone(784, 160, 880);
            break;
        case BuzzerSound::RESET:
            // Crisp two-tone reset chime (duty 850)
            playTone(880, 100, 850);
            break;
        case BuzzerSound::STANDBY_THEME:
            // Soft gentle background music volume (duty 180)
            playTone(STANDBY_THEME_NOTES[0].freq, STANDBY_THEME_NOTES[0].duration, 180);
            break;
        case BuzzerSound::NONE:
        default:
            stopTone();
            break;
    }
}

void BuzzerManager::loop() {
    if (currentSound == BuzzerSound::NONE) return;
    if (currentSound == BuzzerSound::STANDBY_THEME && isBgmMuted) return;
    if (currentSound != BuzzerSound::STANDBY_THEME && isSfxMuted) return;

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
                playTone(1047, 160, 880); // Step 2 (C6)
            } else if (melodyStep == 2) {
                playTone(1319, 400, 880); // Step 3 (E6)
            } else {
                currentSound = BuzzerSound::NONE;
            }
        } else if (currentSound == BuzzerSound::RESET) {
            melodyStep++;
            if (melodyStep == 1) {
                playTone(587, 180, 850); // Step 2 (D5)
            } else {
                currentSound = BuzzerSound::NONE;
                play(BuzzerSound::STANDBY_THEME);
            }
        } else if (currentSound == BuzzerSound::BUTTON_PRESS) {
            currentSound = BuzzerSound::NONE;
        } else if (currentSound == BuzzerSound::BEEP) {
            melodyStep++;
            if (melodyStep == 1) {
                playTone(1319, 90, 840); // Step 2 — crisp finish
            } else {
                currentSound = BuzzerSound::NONE;
            }
        } else if (currentSound == BuzzerSound::GAME_START) {
            melodyStep++;
            if (melodyStep == 1) {
                playTone(659, 100, 860);  // Step 2 (E5)
            } else if (melodyStep == 2) {
                playTone(1047, 180, 870); // Step 3 (C6 — celebratory loud peak)
            } else {
                currentSound = BuzzerSound::NONE;
            }
        } else {
            currentSound = BuzzerSound::NONE;
        }
    }

    // Handle standby ambient theme looping with soft volume
    if (currentSound == BuzzerSound::STANDBY_THEME && currentToneDuration == 0) {
        if (now >= notePauseUntil) {
            melodyStep = (melodyStep + 1) % STANDBY_THEME_LEN;
            const MelodyNote& note = STANDBY_THEME_NOTES[melodyStep];
            playTone(note.freq, note.duration, 180);
        }
    }
}
