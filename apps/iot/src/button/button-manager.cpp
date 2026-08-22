#include "button-manager.h"

ButtonManager buttonManager;

constexpr int QUEUE_SIZE = 32;
static ButtonEvent eventQueue[QUEUE_SIZE];
static volatile int queueHead = 0;
static volatile int queueTail = 0;
static volatile bool playerButtonsEnabled = false;
static portMUX_TYPE buttonMux = portMUX_INITIALIZER_UNLOCKED;

struct PlayerButtonConfig {
    uint8_t pin;
    ButtonType button;
    bool lastState;
    unsigned long lastDebounceTime;
};

static PlayerButtonConfig playerButtons[8] = {
    { PIN_P1_RED,    ButtonType::P1_RED,    HIGH, 0 },
    { PIN_P1_GREEN,  ButtonType::P1_GREEN,  HIGH, 0 },
    { PIN_P1_BLUE,   ButtonType::P1_BLUE,   HIGH, 0 },
    { PIN_P1_YELLOW, ButtonType::P1_YELLOW, HIGH, 0 },
    { PIN_P2_RED,    ButtonType::P2_RED,    HIGH, 0 },
    { PIN_P2_GREEN,  ButtonType::P2_GREEN,  HIGH, 0 },
    { PIN_P2_BLUE,   ButtonType::P2_BLUE,   HIGH, 0 },
    { PIN_P2_YELLOW, ButtonType::P2_YELLOW, HIGH, 0 }
};

void ButtonManager::setupPin(uint8_t pin) {
    pinMode(pin, INPUT_PULLUP);
}

void ButtonManager::init() {
    for (int i = 0; i < 8; i++) {
        setupPin(playerButtons[i].pin);
        playerButtons[i].lastState = digitalRead(playerButtons[i].pin);
        playerButtons[i].lastDebounceTime = 0;
    }

    setupPin(PIN_BTN_START);
    setupPin(PIN_BTN_NEXT);
    setupPin(PIN_BTN_PREV);
    setupPin(PIN_BTN_RESTART);
}

void ButtonManager::update() {
    if (!playerButtonsEnabled) return;

    unsigned long now = millis();

    for (int i = 0; i < 8; i++) {
        uint8_t pin = playerButtons[i].pin;
        int currentState = digitalRead(pin);

        if (playerButtons[i].lastState == HIGH && currentState == LOW) {
            // Button state transition: RELEASED (HIGH) -> PRESSED (LOW)
            if (now - playerButtons[i].lastDebounceTime >= DEBOUNCE_DELAY_MS) {
                // Multi-button press protection: verify no other button of the same player is down
                bool otherHeld = false;
                if (i < 4) {
                    // P1 buttons (indices 0..3)
                    for (int j = 0; j < 4; j++) {
                        if (j != i && digitalRead(playerButtons[j].pin) == LOW) {
                            otherHeld = true;
                            break;
                        }
                    }
                } else {
                    // P2 buttons (indices 4..7)
                    for (int j = 4; j < 8; j++) {
                        if (j != i && digitalRead(playerButtons[j].pin) == LOW) {
                            otherHeld = true;
                            break;
                        }
                    }
                }

                if (!otherHeld) {
                    playerButtons[i].lastDebounceTime = now;
                    playerButtons[i].lastState = LOW;

                    // Push valid unique single press event
                    portENTER_CRITICAL(&buttonMux);
                    int nextHead = (queueHead + 1) % QUEUE_SIZE;
                    if (nextHead != queueTail) {
                        eventQueue[queueHead].button = playerButtons[i].button;
                        eventQueue[queueHead].timestamp = now;
                        queueHead = nextHead;
                    }
                    portEXIT_CRITICAL(&buttonMux);
                }
            }
        } else if (playerButtons[i].lastState == LOW && currentState == HIGH) {
            // Button state transition: PRESSED (LOW) -> RELEASED (HIGH)
            // Record release timestamp for release chatter protection; NO press event emitted on release!
            playerButtons[i].lastDebounceTime = now;
            playerButtons[i].lastState = HIGH;
        }
    }
}

void ButtonManager::enablePlayerButtons() {
    portENTER_CRITICAL(&buttonMux);
    queueHead = 0;
    queueTail = 0;
    for (int i = 0; i < 8; i++) {
        playerButtons[i].lastState = digitalRead(playerButtons[i].pin);
        playerButtons[i].lastDebounceTime = 0;
    }
    playerButtonsEnabled = true;
    portEXIT_CRITICAL(&buttonMux);
}

void ButtonManager::disablePlayerButtons() {
    playerButtonsEnabled = false;
}

bool ButtonManager::hasEvent() {
    return queueHead != queueTail;
}

ButtonEvent ButtonManager::popEvent() {
    ButtonEvent evt = {ButtonType::NONE, 0};
    portENTER_CRITICAL(&buttonMux);
    if (queueHead != queueTail) {
        evt = eventQueue[queueTail];
        queueTail = (queueTail + 1) % QUEUE_SIZE;
    }
    portEXIT_CRITICAL(&buttonMux);
    return evt;
}

void ButtonManager::handleInterrupt(uint8_t pin) {
    // Deprecated in favor of stateful loop update()
}

bool ButtonManager::isStartPressed() {
    static bool lastState = HIGH;
    static unsigned long lastDebounce = 0;
    unsigned long now = millis();
    bool currentState = digitalRead(PIN_BTN_START);
    bool pressed = false;
    
    if (lastState == HIGH && currentState == LOW) {
        if (now - lastDebounce >= DEBOUNCE_DELAY_MS) {
            if (digitalRead(PIN_BTN_NEXT) == HIGH &&
                digitalRead(PIN_BTN_PREV) == HIGH &&
                digitalRead(PIN_BTN_RESTART) == HIGH) {
            pressed = true;
            lastDebounce = now;
        }
        }
    } else if (lastState == LOW && currentState == HIGH) {
        lastDebounce = now;
    }
    lastState = currentState;
    return pressed;
}

bool ButtonManager::isNextPressed() {
    static bool lastState = HIGH;
    static unsigned long lastDebounce = 0;
    unsigned long now = millis();
    bool currentState = digitalRead(PIN_BTN_NEXT);
    bool pressed = false;
    
    if (lastState == HIGH && currentState == LOW) {
        if (now - lastDebounce >= DEBOUNCE_DELAY_MS) {
            if (digitalRead(PIN_BTN_START) == HIGH &&
                digitalRead(PIN_BTN_PREV) == HIGH &&
                digitalRead(PIN_BTN_RESTART) == HIGH) {
            pressed = true;
            lastDebounce = now;
        }
        }
    } else if (lastState == LOW && currentState == HIGH) {
        lastDebounce = now;
    }
    lastState = currentState;
    return pressed;
}

bool ButtonManager::isPrevPressed() {
    static bool lastState = HIGH;
    static unsigned long lastDebounce = 0;
    unsigned long now = millis();
    bool currentState = digitalRead(PIN_BTN_PREV);
    bool pressed = false;
    
    if (lastState == HIGH && currentState == LOW) {
        if (now - lastDebounce >= DEBOUNCE_DELAY_MS) {
            if (digitalRead(PIN_BTN_START) == HIGH &&
                digitalRead(PIN_BTN_NEXT) == HIGH &&
                digitalRead(PIN_BTN_RESTART) == HIGH) {
            pressed = true;
            lastDebounce = now;
        }
        }
    } else if (lastState == LOW && currentState == HIGH) {
        lastDebounce = now;
    }
    lastState = currentState;
    return pressed;
}

bool ButtonManager::isRestartPressed() {
    static bool lastState = HIGH;
    static unsigned long lastDebounce = 0;
    unsigned long now = millis();
    bool currentState = digitalRead(PIN_BTN_RESTART);
    bool pressed = false;
    
    if (lastState == HIGH && currentState == LOW) {
        if (now - lastDebounce >= DEBOUNCE_DELAY_MS) {
            if (digitalRead(PIN_BTN_START) == HIGH &&
                digitalRead(PIN_BTN_NEXT) == HIGH &&
                digitalRead(PIN_BTN_PREV) == HIGH) {
            pressed = true;
            lastDebounce = now;
        }
        }
    } else if (lastState == LOW && currentState == HIGH) {
        lastDebounce = now;
    }
    lastState = currentState;
    return pressed;
}
