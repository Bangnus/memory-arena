#include "game-engine.h"
#include "../led/led-manager.h"
#include "../buzzer/buzzer.h"
#include "../button/button-manager.h"
#include "../api/serial-manager.h"

void GameEngine::handlePlayerInput() {
    while (buttonManager.hasEvent()) {
        ButtonEvent evt = buttonManager.popEvent();
        String colorStr = "";
        bool isP1 = false;
        
        if (evt.button == ButtonType::P1_RED) { colorStr = "RED"; isP1 = true; }
        else if (evt.button == ButtonType::P1_GREEN) { colorStr = "GREEN"; isP1 = true; }
        else if (evt.button == ButtonType::P1_BLUE) { colorStr = "BLUE"; isP1 = true; }
        else if (evt.button == ButtonType::P1_YELLOW) { colorStr = "YELLOW"; isP1 = true; }
        else if (evt.button == ButtonType::P2_RED) { colorStr = "RED"; isP1 = false; }
        else if (evt.button == ButtonType::P2_GREEN) { colorStr = "GREEN"; isP1 = false; }
        else if (evt.button == ButtonType::P2_BLUE) { colorStr = "BLUE"; isP1 = false; }
        else if (evt.button == ButtonType::P2_YELLOW) { colorStr = "YELLOW"; isP1 = false; }
        
        if (colorStr != "") {
            socketClient.sendButtonPress(isP1 ? 1 : 2, colorStr);
            serialManager.sendButtonPress(String(isP1 ? "P1_" : "P2_") + colorStr);
            buzzerManager.playButtonPress();
            
            // Main LED remains off during player input (per user requirement)
            ledManager.turnOffAll();
            
            if (isP1 && !p1Finished) {
                if (p1Input.length < currentSequence.length) {
                    p1Input.inputs[p1Input.length++] = colorStr;
                    if (p1Input.length == currentSequence.length) {
                        p1Input.time = millis() - inputStartTime;
                        p1Finished = true;
                        Serial.printf("[P1] Done in %lu ms\n", p1Input.time);
                    }
                }
            } else if (!isP1 && !p2Finished) {
                if (p2Input.length < currentSequence.length) {
                    p2Input.inputs[p2Input.length++] = colorStr;
                    if (p2Input.length == currentSequence.length) {
                        p2Input.time = millis() - inputStartTime;
                        p2Finished = true;
                        Serial.printf("[P2] Done in %lu ms\n", p2Input.time);
                    }
                }
            }
        }
    }
    
    if (millis() - inputStartTime > INPUT_TIMEOUT_MS && (!p1Finished || !p2Finished)) {
        Serial.println("[INPUT] Timeout!");
        p1Finished = true;
        p2Finished = true;
    }
    
    if (p1Finished && p2Finished) {
        String p1Json = "[";
        for (int i = 0; i < p1Input.length; i++) {
            if (i > 0) p1Json += ",";
            p1Json += "\"" + p1Input.inputs[i] + "\"";
        }
        p1Json += "]";
        
        String p2Json = "[";
        for (int i = 0; i < p2Input.length; i++) {
            if (i > 0) p2Json += ",";
            p2Json += "\"" + p2Input.inputs[i] + "\"";
        }
        p2Json += "]";
        
        socketClient.submitInput(currentSessionId, currentRound, p1Json, p1Input.time, p2Json, p2Input.time);
        serialManager.sendInput(currentSessionId, currentRound, p1Json, p1Input.time, p2Json, p2Input.time);
        Serial.printf("[RESULT] R%d P1:%dms P2:%dms\n", currentRound, p1Input.time, p2Input.time);
        changeState(GameState::ROUND_RESULT);
    }
}
