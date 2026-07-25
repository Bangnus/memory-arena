#include "game-engine.h"
#include "../led/led-manager.h"
#include "../buzzer/buzzer.h"
#include "../button/button-manager.h"
#include "../wifi/wifi-manager.h"

GameEngine gameEngine;

void GameEngine::init() {
    changeState(GameState::BOOT);
}

void GameEngine::changeState(GameState newState) {
    currentState = newState;
    stateStartTime = millis();
    
    Serial.print("[GAME ENGINE] State -> ");
    switch(currentState) {
        case GameState::BOOT:
            Serial.println("BOOT");
            ledManager.startCycling();
            buzzerManager.playBoot();
            buttonManager.disablePlayerButtons();
            break;
        case GameState::WAIT_PLAYERS:
            Serial.println("WAIT_PLAYERS");
            ledManager.startBlinking(); // Breathing/Blinking White
            buzzerManager.playReset();
            buttonManager.disablePlayerButtons();
            break;
        case GameState::COUNTDOWN:
            Serial.println("COUNTDOWN");
            ledManager.stopAnimation();
            countdownStep = 3;
            lastCountdownTime = 0;
            buttonManager.disablePlayerButtons();
            break;
        case GameState::SHOW_SEQUENCE:
            Serial.println("SHOW_SEQUENCE");
            ledManager.stopAnimation();
            sequenceDisplayIndex = 0;
            lastSequenceDisplayTime = millis();
            buttonManager.disablePlayerButtons();
            if(!apiClient.getSequence(currentSequence)) {
                Serial.println("[GAME ENGINE] Failed to fetch sequence, reverting to WAIT_PLAYERS");
                changeState(GameState::WAIT_PLAYERS); 
            } else {
                Serial.printf("[GAME ENGINE] Sequence fetched! Length: %d, Speed: %d ms\n", currentSequence.length, currentSequence.displaySpeed);
            }
            break;
        case GameState::PLAYER_INPUT:
            Serial.println("PLAYER_INPUT (Buttons Enabled)");
            ledManager.stopAnimation();
            p1Input.length = 0;
            p2Input.length = 0;
            p1Finished = false;
            p2Finished = false;
            inputStartTime = millis();
            ledManager.turnOffAll();
            buttonManager.enablePlayerButtons();
            buzzerManager.play(BuzzerSound::BEEP);
            break;
        case GameState::ROUND_RESULT:
            Serial.println("ROUND_RESULT");
            buttonManager.disablePlayerButtons();
            ledManager.startBlinking();
            break;
        case GameState::GAME_RESULT:
            Serial.println("GAME_RESULT");
            buttonManager.disablePlayerButtons();
            ledManager.startCycling();
            buzzerManager.playWinner();
            break;
        default:
            Serial.println("UNKNOWN");
            break;
    }
}

void GameEngine::pollBackend() {
    unsigned long now = millis();
    if (now - lastPollTime >= 2000) {
        lastPollTime = now;
        
        GameStateData state;
        if (apiClient.getCurrentState(state)) {
            currentSessionId = state.id; // Store session ID
            if ((state.status == "COUNTDOWN" || state.status == "READY") && currentState != GameState::COUNTDOWN && currentState != GameState::SHOW_SEQUENCE && currentState != GameState::PLAYER_INPUT) {
                changeState(GameState::COUNTDOWN);
            } else if (state.status == "WAITING" && currentState != GameState::WAIT_PLAYERS) {
                changeState(GameState::WAIT_PLAYERS);
            }
        }
    }
}

void GameEngine::loop() {
    ledManager.loop();
    buzzerManager.loop();
    wifiManager.loop();
    apiClient.loop();
    
    switch (currentState) {
        case GameState::BOOT:
            if (wifiManager.isConnected() && apiClient.checkBackendStatus()) {
                changeState(GameState::WAIT_PLAYERS);
            }
            break;
        case GameState::WAIT_PLAYERS:
            if (buttonManager.isStartPressed()) {
                buzzerManager.play(BuzzerSound::BEEP);
                if (apiClient.signalStart()) {
                    changeState(GameState::WAIT_PLAYERS);
                }
            }
            pollBackend();
            break;
        case GameState::COUNTDOWN:
            handleCountdown();
            break;
        case GameState::SHOW_SEQUENCE:
            handleShowSequence();
            break;
        case GameState::PLAYER_INPUT:
            handlePlayerInput();
            break;
        case GameState::ROUND_RESULT:
            handleRoundResult();
            break;
        case GameState::GAME_RESULT:
            handleMatchResult();
            break;
        default:
            break;
    }
}

void GameEngine::handleCountdown() {
    unsigned long now = millis();
    if (now - lastCountdownTime >= 1000) {
        lastCountdownTime = now;
        if (countdownStep > 0) {
            buzzerManager.play(BuzzerSound::BEEP);
            countdownStep--;
        } else {
            buzzerManager.playCorrect();
            changeState(GameState::SHOW_SEQUENCE);
        }
    }
}

void GameEngine::handleShowSequence() {
    unsigned long now = millis();
    unsigned long speed = currentSequence.displaySpeed > 0 ? currentSequence.displaySpeed : 500;
    
    if (now - lastSequenceDisplayTime >= speed) {
        lastSequenceDisplayTime = now;
        
        if (sequenceDisplayIndex < currentSequence.length) {
            String colorStr = currentSequence.sequence[sequenceDisplayIndex];
            LedColor color = LedColor::NONE;
            if (colorStr == "RED") color = LedColor::RED;
            else if (colorStr == "BLUE") color = LedColor::BLUE;
            
            ledManager.turnOn(color);
            buzzerManager.play(BuzzerSound::BEEP);
            sequenceDisplayIndex++;
        } else if (sequenceDisplayIndex == currentSequence.length) {
            ledManager.turnOffAll();
            sequenceDisplayIndex++;
        } else {
            changeState(GameState::PLAYER_INPUT);
        }
    } else if (now - lastSequenceDisplayTime >= speed / 2) {
        ledManager.turnOffAll();
    }
}

void GameEngine::handlePlayerInput() {
    while (buttonManager.hasEvent()) {
        ButtonEvent evt = buttonManager.popEvent();
        String colorStr = "";
        bool isP1 = false;
        
        if (evt.button == ButtonType::P1_RED) { colorStr = "RED"; isP1 = true; }
        else if (evt.button == ButtonType::P1_BLUE) { colorStr = "BLUE"; isP1 = true; }
        else if (evt.button == ButtonType::P2_RED) { colorStr = "RED"; isP1 = false; }
        else if (evt.button == ButtonType::P2_BLUE) { colorStr = "BLUE"; isP1 = false; }
        
        if (colorStr != "") {
            Serial.printf("[INPUT] %s pressed: %s (%d/%d)\n", 
                isP1 ? "Player 1" : "Player 2", 
                colorStr.c_str(), 
                isP1 ? p1Input.length + 1 : p2Input.length + 1, 
                currentSequence.length);

            LedColor color = LedColor::NONE;
            if (colorStr == "RED") color = LedColor::RED;
            else if (colorStr == "BLUE") color = LedColor::BLUE;
            ledManager.turnOn(color);
            
            if (isP1 && !p1Finished) {
                if (p1Input.length < currentSequence.length) {
                    p1Input.inputs[p1Input.length++] = colorStr;
                    if (p1Input.length == currentSequence.length) {
                        p1Input.time = millis() - inputStartTime;
                        p1Finished = true;
                        Serial.printf("[INPUT] Player 1 Finished Input in %lu ms!\n", p1Input.time);
                    }
                }
            } else if (!isP1 && !p2Finished) {
                if (p2Input.length < currentSequence.length) {
                    p2Input.inputs[p2Input.length++] = colorStr;
                    if (p2Input.length == currentSequence.length) {
                        p2Input.time = millis() - inputStartTime;
                        p2Finished = true;
                        Serial.printf("[INPUT] Player 2 Finished Input in %lu ms!\n", p2Input.time);
                    }
                }
            }
        }
    }
    
    if (millis() - inputStartTime > INPUT_TIMEOUT_MS && (!p1Finished || !p2Finished)) {
        Serial.println("[INPUT] Input Timeout 15s reached!");
        p1Finished = true;
        p2Finished = true;
    }
    
    if (p1Finished && p2Finished) {
        Serial.printf("[INPUT] Submitting inputs to Backend... P1: %d inputs, P2: %d inputs\n", p1Input.length, p2Input.length);
        RoundResultData res;
        if (apiClient.submitInput(currentSessionId, currentRound, p1Input, p2Input, res)) {
            Serial.printf("[INPUT] Backend Accepted! MatchFinished: %s, Winner: %d, P1Score: %d, P2Score: %d\n",
                res.matchFinished ? "YES" : "NO", res.winner, res.player1Score, res.player2Score);
            if (res.matchFinished) {
                changeState(GameState::GAME_RESULT);
            } else {
                changeState(GameState::ROUND_RESULT);
            }
        } else {
            Serial.println("[INPUT] Submit Input Failed! Reverting to WAIT_PLAYERS");
            changeState(GameState::WAIT_PLAYERS);
        }
    }
}

void GameEngine::handleRoundResult() {
    unsigned long now = millis();
    if (now - stateStartTime >= 3000) {
        pollBackend();
    }
}

void GameEngine::handleMatchResult() {
    unsigned long now = millis();
    if (now - stateStartTime >= 5000) {
        changeState(GameState::WAIT_PLAYERS);
    }
}
