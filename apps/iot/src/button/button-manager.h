#pragma once

#include <Arduino.h>
#include "../config/constants.h"
#include "../config/pins.h"

struct ButtonEvent {
    ButtonType button;
    unsigned long timestamp;
};

class ButtonManager {
public:
    void init();
    void update();
    void enablePlayerButtons();
    void disablePlayerButtons();

    bool hasEvent();
    ButtonEvent popEvent();

    bool isStartPressed();
    bool isNextPressed();
    bool isPrevPressed();
    bool isRestartPressed();

    void handleInterrupt(uint8_t pin);

private:
    void setupPin(uint8_t pin);
};

extern ButtonManager buttonManager;
