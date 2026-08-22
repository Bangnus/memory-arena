#include "button-manager.h"

ButtonManager buttonManager;

constexpr int QUEUE_SIZE = 32;
static ButtonEvent eventQueue[QUEUE_SIZE];
static volatile int queueHead = 0;
static volatile int queueTail = 0;
static volatile bool playerButtonsEnabled = false;

static unsigned long lastDebounceTime[40] = {0};
static volatile bool pinHeldState[40] = {false};
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
    int state = digitalRead(pin);

    if (state == HIGH) {
        // Physical release: only unlatch if debounce window has passed since press!
        // Prevents release chatter/bounce from resetting held state prematurely
        if (now - lastDebounceTime[pin] >= DEBOUNCE_DELAY_MS) {
            pinHeldState[pin] = false;
        }
        return;
    }

    // State is LOW (Button Pressed)
    // If still held down or within per-pin debounce lockout -> ignore chatter
    if (pinHeldState[pin]) return;
    if (now - lastDebounceTime[pin] < DEBOUNCE_DELAY_MS) return;

    // Register valid unique press
    pinHeldState[pin] = true;
    lastDebounceTime[pin] = now;

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

    // Use CHANGE to detect both Press (LOW) and Release (HIGH) cleanly
    attachInterrupt(digitalPinToInterrupt(PIN_P1_RED), isr_p1_red, CHANGE);
    attachInterrupt(digitalPinToInterrupt(PIN_P1_GREEN), isr_p1_green, CHANGE);
    attachInterrupt(digitalPinToInterrupt(PIN_P1_BLUE), isr_p1_blue, CHANGE);
    attachInterrupt(digitalPinToInterrupt(PIN_P1_YELLOW), isr_p1_yellow, CHANGE);

    attachInterrupt(digitalPinToInterrupt(PIN_P2_RED), isr_p2_red, CHANGE);
    attachInterrupt(digitalPinToInterrupt(PIN_P2_GREEN), isr_p2_green, CHANGE);
    attachInterrupt(digitalPinToInterrupt(PIN_P2_BLUE), isr_p2_blue, CHANGE);
    attachInterrupt(digitalPinToInterrupt(PIN_P2_YELLOW), isr_p2_yellow, CHANGE);
}

void ButtonManager::enablePlayerButtons() {
    portENTER_CRITICAL(&buttonMux);
    queueHead = 0;
    queueTail = 0;
    for (int i = 0; i < 40; i++) {
        pinHeldState[i] = false;
        lastDebounceTime[i] = 0;
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
            pressed = true;
            lastDebounce = now;
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
            pressed = true;
            lastDebounce = now;
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
            pressed = true;
            lastDebounce = now;
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
            pressed = true;
            lastDebounce = now;
        }
    } else if (lastState == LOW && currentState == HIGH) {
        lastDebounce = now;
    }
    lastState = currentState;
    return pressed;
}
