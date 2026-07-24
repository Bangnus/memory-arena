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
    
    switch(currentState) {
        case GameState::BOOT:
            ledManager.startCycling();
            buzzerManager.playBoot();
            buttonManager.disablePlayerButtons();
            break;
        case GameState::WAIT_PLAYERS:
            ledManager.startBlinking(); // Breathing/Blinking White
            buzzerManager.playReset();
            buttonManager.disablePlayerButtons();
            break;
        case GameState::COUNTDOWN:
            countdownStep = 3;
            lastCountdownTime = 0;
            buttonManager.disablePlayerButtons();
            break;
        case GameState::SHOW_SEQUENCE:
            sequenceDisplayIndex = 0;
            lastSequenceDisplayTime = millis();
            buttonManager.disablePlayerButtons();
            if(!apiClient.getSequence(currentSequence)) {
                changeState(GameState::WAIT_PLAYERS); 
            }
            break;
        case GameState::PLAYER_INPUT:
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
            buttonManager.disablePlayerButtons();
            ledManager.startBlinking();
            break;
        case GameState::GAME_RESULT:
            buttonManager.disablePlayerButtons();
            ledManager.startCycling();
            buzzerManager.playWinner();
            break;
        default:
            break;
    }
}

void GameEngine::pollBackend() {
    unsigned long now = millis();
    if (now - lastPollTime >= 1000) {
        lastPollTime = now;
        
        GameStateData state;
        if (apiClient.getCurrentState(state)) {
            if (state.status == "COUNTDOWN" && currentState != GameState::COUNTDOWN && currentState != GameState::SHOW_SEQUENCE && currentState != GameState::PLAYER_INPUT) {
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
    if (now - lastSequenceDisplayTime >= (unsigned long)currentSequence.displaySpeed) {
        lastSequenceDisplayTime = now;
        
        if (sequenceDisplayIndex < currentSequence.length) {
            String colorStr = currentSequence.sequence[sequenceDisplayIndex];
            LedColor color = LedColor::NONE;
            if (colorStr == "RED") color = LedColor::RED;
            else if (colorStr == "GREEN") color = LedColor::GREEN;
            else if (colorStr == "BLUE") color = LedColor::BLUE;
            else if (colorStr == "YELLOW") color = LedColor::YELLOW;
            
            ledManager.turnOn(color);
            buzzerManager.play(BuzzerSound::BEEP);
            sequenceDisplayIndex++;
        } else if (sequenceDisplayIndex == currentSequence.length) {
            ledManager.turnOffAll();
            sequenceDisplayIndex++;
        } else {
            changeState(GameState::PLAYER_INPUT);
        }
    }
}

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
            LedColor color = LedColor::NONE;
            if (colorStr == "RED") color = LedColor::RED;
            else if (colorStr == "GREEN") color = LedColor::GREEN;
            else if (colorStr == "BLUE") color = LedColor::BLUE;
            else if (colorStr == "YELLOW") color = LedColor::YELLOW;
            ledManager.turnOn(color);
            
            if (isP1 && !p1Finished) {
                if (p1Input.length < currentSequence.length) {
                    p1Input.inputs[p1Input.length++] = colorStr;
                    if (p1Input.length == currentSequence.length) {
                        p1Input.time = millis() - inputStartTime;
                        p1Finished = true;
                    }
                }
            } else if (!isP1 && !p2Finished) {
                if (p2Input.length < currentSequence.length) {
                    p2Input.inputs[p2Input.length++] = colorStr;
                    if (p2Input.length == currentSequence.length) {
                        p2Input.time = millis() - inputStartTime;
                        p2Finished = true;
                    }
                }
            }
        }
    }
    
    if (millis() - inputStartTime > INPUT_TIMEOUT_MS) {
        p1Finished = true;
        p2Finished = true;
    }
    
    if (p1Finished && p2Finished) {
        RoundResultData res;
        if (apiClient.submitInput(currentSessionId, currentRound, p1Input, p2Input, res)) {
            if (res.matchFinished) {
                changeState(GameState::GAME_RESULT);
            } else {
                changeState(GameState::ROUND_RESULT);
            }
        } else {
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
