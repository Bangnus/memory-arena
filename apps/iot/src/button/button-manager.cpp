#include "button-manager.h"

ButtonManager buttonManager;

constexpr int QUEUE_SIZE = 32;
static ButtonEvent eventQueue[QUEUE_SIZE];
static volatile int queueHead = 0;
static volatile int queueTail = 0;
static volatile bool playerButtonsEnabled = false;

static unsigned long lastDebounceTime[40] = {0};

void IRAM_ATTR isr_p1_red()  { buttonManager.handleInterrupt(PIN_P1_RED); }
void IRAM_ATTR isr_p1_blue() { buttonManager.handleInterrupt(PIN_P1_BLUE); }
void IRAM_ATTR isr_p2_red()  { buttonManager.handleInterrupt(PIN_P2_RED); }
void IRAM_ATTR isr_p2_blue() { buttonManager.handleInterrupt(PIN_P2_BLUE); }

void ButtonManager::handleInterrupt(uint8_t pin) {
    if (!playerButtonsEnabled) return;

    unsigned long now = millis();
    if (now - lastDebounceTime[pin] < DEBOUNCE_DELAY_MS) return;
    if (digitalRead(pin) == HIGH) return; // Ignore transient noise spikes
    lastDebounceTime[pin] = now;

    ButtonType btn = ButtonType::NONE;
    if (pin == PIN_P1_RED) btn = ButtonType::P1_RED;
    else if (pin == PIN_P1_BLUE) btn = ButtonType::P1_BLUE;
    else if (pin == PIN_P2_RED) btn = ButtonType::P2_RED;
    else if (pin == PIN_P2_BLUE) btn = ButtonType::P2_BLUE;

    if (btn != ButtonType::NONE) {
        int nextHead = (queueHead + 1) % QUEUE_SIZE;
        if (nextHead != queueTail) {
            eventQueue[queueHead].button = btn;
            eventQueue[queueHead].timestamp = now;
            queueHead = nextHead;
        }
    }
}

void ButtonManager::setupPin(uint8_t pin) {
    pinMode(pin, INPUT_PULLUP);
}

void ButtonManager::init() {
    setupPin(PIN_P1_RED);
    setupPin(PIN_P1_BLUE);
    setupPin(PIN_P2_RED);
    setupPin(PIN_P2_BLUE);
    setupPin(PIN_BTN_START);
    setupPin(PIN_BTN_NEXT);
    setupPin(PIN_BTN_PREV);

    attachInterrupt(digitalPinToInterrupt(PIN_P1_RED), isr_p1_red, FALLING);
    attachInterrupt(digitalPinToInterrupt(PIN_P1_BLUE), isr_p1_blue, FALLING);
    attachInterrupt(digitalPinToInterrupt(PIN_P2_RED), isr_p2_red, FALLING);
    attachInterrupt(digitalPinToInterrupt(PIN_P2_BLUE), isr_p2_blue, FALLING);
}

void ButtonManager::enablePlayerButtons() {
    queueHead = 0;
    queueTail = 0;
    playerButtonsEnabled = true;
}

void ButtonManager::disablePlayerButtons() {
    playerButtonsEnabled = false;
}

bool ButtonManager::hasEvent() {
    return queueHead != queueTail;
}

ButtonEvent ButtonManager::popEvent() {
    ButtonEvent evt = {ButtonType::NONE, 0};
    if (hasEvent()) {
        evt = eventQueue[queueTail];
        queueTail = (queueTail + 1) % QUEUE_SIZE;
    }
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
