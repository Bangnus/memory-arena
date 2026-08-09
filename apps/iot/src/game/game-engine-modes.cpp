#include "game-engine.h"
#include "../buzzer/buzzer.h"
#include "../button/button-manager.h"

void GameEngine::handleSelectMode() {
    unsigned long now = millis();
    if (now - lastButtonTime < 200) return;

    if (buttonManager.isNextPressed()) {
        lastButtonTime = now;
        selectedMode = (selectedMode + 1) % 3;
        Serial.printf("[DEBUG][IOT] Button NEXT (pin %d) pressed. Changed mode to: %s (%d)\n", PIN_BTN_NEXT, modes[selectedMode], selectedMode);
        buzzerManager.play(BuzzerSound::BEEP);
        socketClient.signalModeChange(selectedMode);
    }

    if (buttonManager.isPrevPressed()) {
        lastButtonTime = now;
        selectedMode = (selectedMode + 2) % 3;
        Serial.printf("[DEBUG][IOT] Button PREV (pin %d) pressed. Changed mode to: %s (%d)\n", PIN_BTN_PREV, modes[selectedMode], selectedMode);
        buzzerManager.play(BuzzerSound::BEEP);
        socketClient.signalModeChange(selectedMode);
    }

    if (buttonManager.isStartPressed()) {
        lastButtonTime = now;
        buzzerManager.playCorrect();
        Serial.printf("[MODE] Selected: %s\n", modes[selectedMode]);
        socketClient.setDifficulty(modes[selectedMode]);
        socketClient.signalStart();
    }
}

void GameEngine::handleWaitingCountdown() {
    if (!waitingCountdownActive) return;

    unsigned long now = millis();
    if (now - lastWaitingCountdownTime >= 1000) {
        lastWaitingCountdownTime = now;
        if (waitingCountdownStep > 0) {
            Serial.printf("[DEBUG][IOT][%lu] waiting countdown: %d\n", now, waitingCountdownStep);
            buzzerManager.play(BuzzerSound::BEEP);
            waitingCountdownStep--;
        } else {
            Serial.printf("[DEBUG][IOT][%lu] waiting countdown complete, playGameStart\n", now);
            buzzerManager.playGameStart();
            waitingCountdownActive = false;
        }
    }
}

void GameEngine::handleCountdown() {
    unsigned long now = millis();
    
    if (now - lastCountdownTime >= 1000) {
        lastCountdownTime = now;
        if (countdownStep > 0) {
            Serial.printf("[DEBUG][IOT][%lu] countdown: %d\n", now, countdownStep);
            if (!waitingCountdownActive) {
                buzzerManager.play(BuzzerSound::COUNTDOWN);
            }
            countdownStep--;
        } else {
            if (waitingCountdownActive) return;
            Serial.printf("[DEBUG][IOT][%lu] countdown complete -> SHOW_SEQUENCE\n", now);
            buzzerManager.playCorrect();
            changeState(GameState::SHOW_SEQUENCE);
        }
    }
}
