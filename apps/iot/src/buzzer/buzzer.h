#pragma once

#include <Arduino.h>
#include "../config/pins.h"

enum class BuzzerSound {
    NONE = 0,
    BOOT,
    BEEP,
    CORRECT,
    WRONG,
    VICTORY
};

class BuzzerManager {
public:
    void init();
    void play(BuzzerSound sound);
    void playBoot();
    void playCountdown();
    void playCorrect();
    void playWrong();
    void playWinner();
    void playReset();
    void loop();

private:
    unsigned long currentToneStart = 0;
    unsigned long currentToneDuration = 0;

    int melodyStep = 0;
    BuzzerSound currentSound = BuzzerSound::NONE;

    void playTone(unsigned int frequency, unsigned long duration);
    void stopTone();
};

extern BuzzerManager buzzerManager;
