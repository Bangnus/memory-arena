#include "button-manager.h"

ButtonManager buttonManager;

constexpr int QUEUE_SIZE = 32;
static ButtonEvent eventQueue[QUEUE_SIZE];
static volatile int queueHead = 0;
static volatile int queueTail = 0;
static volatile bool playerButtonsEnabled = false;

static unsigned long lastPressTime[40] = {0};
static portMUX_TYPE buttonMux = portMUX_INITIALIZER_UNLOCKED;

void IRAM_ATTR isr_p1_red()    { buttonManager.handleInterrupt(PIN_P1_RED); }
void IRAM_ATTR isr_p1_green()  { buttonManager.handleInterrupt(PIN_P1_GREEN); }
void IRAM_ATTR isr_p1_blue()   { buttonManager.handleInterrupt(PIN_P1_BLUE); }
void IRAM_ATTR isr_p1_yellow() { buttonManager.handleInterrupt(PIN_P1_YELLOW); }

void IRAM_ATTR isr_p2_red()    { buttonManager.handleInterrupt(PIN_P2_RED); }
void IRAM_ATTR isr_p2_green()  { buttonManager.handleInterrupt(PIN_P2_GREEN); }
void IRAM_ATTR isr_p2_blue()   { buttonManager.handleInterrupt(PIN_P2_BLUE); }
void IRAM_ATTR isr_p2_yellow() { buttonManager.handleInterrupt(PIN_P2_YELLOW); }

void ButtonManager::handleInterrupt(uint8_t pin) {
    if (!playerButtonsEnabled) return;

    unsigned long now = millis();

    // Per-pin debounce lockout: ignore contact bounce chatter within 120ms for this same pin
    if (now - lastPressTime[pin] < DEBOUNCE_DELAY_MS) return;

    // Disallow simultaneous button presses: check if another pin of this player is currently held LOW
    if (pin == PIN_P1_RED || pin == PIN_P1_GREEN || pin == PIN_P1_BLUE || pin == PIN_P1_YELLOW) {
        const uint8_t p1Pins[4] = { PIN_P1_RED, PIN_P1_GREEN, PIN_P1_BLUE, PIN_P1_YELLOW };
        for (int i = 0; i < 4; i++) {
            if (p1Pins[i] != pin && digitalRead(p1Pins[i]) == LOW) {
                return; // Another button of P1 is held down simultaneously
            }
        }
    } else if (pin == PIN_P2_RED || pin == PIN_P2_GREEN || pin == PIN_P2_BLUE || pin == PIN_P2_YELLOW) {
        const uint8_t p2Pins[4] = { PIN_P2_RED, PIN_P2_GREEN, PIN_P2_BLUE, PIN_P2_YELLOW };
        for (int i = 0; i < 4; i++) {
            if (p2Pins[i] != pin && digitalRead(p2Pins[i]) == LOW) {
                return; // Another button of P2 is held down simultaneously
            }
        }
    }

    // Valid unique single press
    lastPressTime[pin] = now;

    ButtonType btn = ButtonType::NONE;
    if (pin == PIN_P1_RED) btn = ButtonType::P1_RED;
    else if (pin == PIN_P1_GREEN) btn = ButtonType::P1_GREEN;
    else if (pin == PIN_P1_BLUE) btn = ButtonType::P1_BLUE;
    else if (pin == PIN_P1_YELLOW) btn = ButtonType::P1_YELLOW;
    else if (pin == PIN_P2_RED) btn = ButtonType::P2_RED;
    else if (pin == PIN_P2_GREEN) btn = ButtonType::P2_GREEN;
    else if (pin == PIN_P2_BLUE) btn = ButtonType::P2_BLUE;
    else if (pin == PIN_P2_YELLOW) btn = ButtonType::P2_YELLOW;

    if (btn != ButtonType::NONE) {
        portENTER_CRITICAL_ISR(&buttonMux);
        int nextHead = (queueHead + 1) % QUEUE_SIZE;
        if (nextHead != queueTail) {
            eventQueue[queueHead].button = btn;
            eventQueue[queueHead].timestamp = now;
            queueHead = nextHead;
        }
        portEXIT_CRITICAL_ISR(&buttonMux);
    }
}

void ButtonManager::setupPin(uint8_t pin) {
    pinMode(pin, INPUT_PULLUP);
}

void ButtonManager::init() {
    setupPin(PIN_P1_RED);
    setupPin(PIN_P1_GREEN);
    setupPin(PIN_P1_BLUE);
    setupPin(PIN_P1_YELLOW);

    setupPin(PIN_P2_RED);
    setupPin(PIN_P2_GREEN);
    setupPin(PIN_P2_BLUE);
    setupPin(PIN_P2_YELLOW);

    setupPin(PIN_BTN_START);
    setupPin(PIN_BTN_NEXT);
    setupPin(PIN_BTN_PREV);
    setupPin(PIN_BTN_RESTART);

    // Use FALLING to trigger cleanly only on button press down (HIGH to LOW)
    attachInterrupt(digitalPinToInterrupt(PIN_P1_RED), isr_p1_red, FALLING);
    attachInterrupt(digitalPinToInterrupt(PIN_P1_GREEN), isr_p1_green, FALLING);
    attachInterrupt(digitalPinToInterrupt(PIN_P1_BLUE), isr_p1_blue, FALLING);
    attachInterrupt(digitalPinToInterrupt(PIN_P1_YELLOW), isr_p1_yellow, FALLING);

    attachInterrupt(digitalPinToInterrupt(PIN_P2_RED), isr_p2_red, FALLING);
    attachInterrupt(digitalPinToInterrupt(PIN_P2_GREEN), isr_p2_green, FALLING);
    attachInterrupt(digitalPinToInterrupt(PIN_P2_BLUE), isr_p2_blue, FALLING);
    attachInterrupt(digitalPinToInterrupt(PIN_P2_YELLOW), isr_p2_yellow, FALLING);
}

void ButtonManager::enablePlayerButtons() {
    portENTER_CRITICAL(&buttonMux);
    queueHead = 0;
    queueTail = 0;
    for (int i = 0; i < 40; i++) {
        lastPressTime[i] = 0;
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
