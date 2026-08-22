#pragma once

#include <Arduino.h>
#include "../config/pins.h"

enum class BuzzerSound {
    NONE = 0,
    BOOT,
    BEEP,
    COUNTDOWN,
    BUTTON_PRESS,
    INPUT_READY,
    GAME_START,
    CORRECT,
    WRONG,
    VICTORY,
    STANDBY_THEME
};

class BuzzerManager {
public:
    void init();
    void play(BuzzerSound sound);
    void playBoot();
    void playCountdown();
    void playButtonPress();
    void playInputReady();
    void playGameStart();
    void playCorrect();
    void playWrong();
    void playWinner();
    void playReset();
    void playStandbyTheme();
    void stop();
    void setMuted(bool mute);
    bool isSoundMuted() const;
    void loop();

private:
    unsigned long currentToneStart = 0;
    unsigned long currentToneDuration = 0;
    unsigned long notePauseUntil = 0;

    bool isMuted = false;
    int melodyStep = 0;
    BuzzerSound currentSound = BuzzerSound::NONE;

    void playTone(unsigned int frequency, unsigned long duration);
    void stopTone();
};

extern BuzzerManager buzzerManager;
