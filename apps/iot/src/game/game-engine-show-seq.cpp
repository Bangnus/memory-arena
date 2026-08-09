#include "game-engine.h"
#include "../led/led-manager.h"
#include "../buzzer/buzzer.h"
#include "../button/button-manager.h"

void GameEngine::handleShowSequence() {
    unsigned long now = millis();
    
    if (!sequenceFetched) {
        if (currentSequence.length == 0) {
            socketClient.loop();
            GameSequenceData seq;
            if (apiClient.getSequence(seq)) {
                currentSequence = seq;
                if (currentSequence.sequenceStartAt == 0 && currentSequence.startInMs > 0) {
                    currentSequence.sequenceStartAt = millis() + currentSequence.startInMs;
                }
            }
            socketClient.loop();
            if (currentSequence.length == 0) return;
        }
        if (currentSequence.sequenceStartAt == 0) {
            currentSequence.sequenceStartAt = millis();
        }
        sequenceFetched = true;
        lastSequenceDisplayTime = now;
        return;
    }

    if (now < currentSequence.sequenceStartAt) {
        unsigned long remaining = currentSequence.sequenceStartAt - now;
        int step = (remaining + 999) / 1000;
        if (step > 0 && step <= 3 && step < countdownStep) {
            countdownStep = step;
            Serial.printf("[DEBUG][IOT][%lu] countdown tick: %d (remaining=%lums)\n", now, step, remaining);
        }

        static unsigned long lastWaitLog = 0;
        if (now - lastWaitLog >= 500) {
            Serial.printf("[DEBUG][IOT][%lu] waiting for startAt=%lu, remaining=%lums\n", now, currentSequence.sequenceStartAt, remaining);
            lastWaitLog = now;
        }
        return;
    }
    
    unsigned long speed = currentSequence.displaySpeed > 0 ? currentSequence.displaySpeed : 500;
    
    if (sequenceDisplayIndex == 0 || now - lastSequenceDisplayTime >= speed) {
        lastSequenceDisplayTime = now;
        
        if (sequenceDisplayIndex < currentSequence.length) {
            String colorStr = currentSequence.sequence[sequenceDisplayIndex];
            LedColor color = LedColor::NONE;
            if (colorStr == "RED") color = LedColor::RED;
            else if (colorStr == "BLUE") color = LedColor::BLUE;
            
            Serial.printf("[DEBUG][IOT][%lu] LED step %d/%d: %s\n", millis(), sequenceDisplayIndex + 1, currentSequence.length, colorStr.c_str());
            ledManager.turnOn(color);
            buzzerManager.play(BuzzerSound::BEEP);
            sequenceDisplayIndex++;
        } else {
            Serial.printf("[DEBUG][IOT][%lu] sequence display complete, entering PLAYER_INPUT\n", millis());
            ledManager.turnOffAll();
            changeState(GameState::PLAYER_INPUT);
        }
    } else if (now - lastSequenceDisplayTime >= (speed * 65) / 100) {
        ledManager.turnOffAll();
    }
}
