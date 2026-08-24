#pragma once

#include <Arduino.h>
#include "../config/constants.h"
#include "../config/pins.h"

struct ButtonEvent {
    ButtonType button;
    unsigned long timestamp;
};

enum class RestartAction {
    NONE = 0,
    SHORT_PRESS,
    LONG_PRESS_5S
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
    RestartAction getRestartAction();

    void handleInterrupt(uint8_t pin);

private:
    void setupPin(uint8_t pin);

    // Restart button long-press tracking
    bool restartLastState = HIGH;
    bool isRestartHeld = false;
    bool restartDbResetTriggered = false;
    unsigned long restartPressStartTime = 0;
};

extern ButtonManager buttonManager;

