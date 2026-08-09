#include "game-engine.h"
#include "../led/led-manager.h"
#include "../buzzer/buzzer.h"
#include "../button/button-manager.h"

void GameEngine::changeState(GameState newState) {
    currentState = newState;
    stateStartTime = millis();
    
    switch(currentState) {
        case GameState::BOOT:
            Serial.println("[STATE] BOOT");
            ledManager.startCycling();
            buzzerManager.playBoot();
            buttonManager.disablePlayerButtons();
            break;
        case GameState::SELECT_MODE:
            selectedMode = 1;
            ledManager.turnOffAll();
            break;
        case GameState::WAIT_PLAYERS:
            Serial.println("[STATE] WAIT_PLAYERS");
            ledManager.startBlinking();
            buzzerManager.playReset();
            buttonManager.disablePlayerButtons();
            currentSequence.length = 0;
            currentSequence.sequenceStartAt = 0;
            break;
        case GameState::COUNTDOWN:
            Serial.printf("[DEBUG][IOT][%lu] STATE -> COUNTDOWN (3s countdown)\n", millis());
            ledManager.stopAnimation();
            countdownStep = 3;
            lastCountdownTime = 0;
            sequenceFetched = false;
            buttonManager.disablePlayerButtons();
            break;
        case GameState::SHOW_SEQUENCE:
            Serial.printf("[DEBUG][IOT][%lu] STATE -> SHOW_SEQUENCE (startAt=%lu, len=%d)\n", millis(), currentSequence.sequenceStartAt, currentSequence.length);
            ledManager.stopAnimation();
            sequenceDisplayIndex = 0;
            lastSequenceDisplayTime = 0;
            sequenceFetched = false;
            buttonManager.disablePlayerButtons();
            if (countdownStep == 2) {
                countdownStep = 3;
            } else {
                countdownStep = 4;
            }
            break;
        case GameState::PLAYER_INPUT:
            Serial.println("[STATE] INPUT (Buttons ON)");
            ledManager.stopAnimation();
            p1Input.length = 0;
            p2Input.length = 0;
            p1Finished = false;
            p2Finished = false;
            inputStartTime = millis();
            ledManager.turnOffAll();
            buttonManager.enablePlayerButtons();
            buzzerManager.playInputReady();
            break;
        case GameState::ROUND_RESULT:
            Serial.println("[STATE] ROUND_RESULT");
            buttonManager.disablePlayerButtons();
            ledManager.startBlinking();
            break;
        case GameState::GAME_RESULT:
            Serial.println("[STATE] GAME_RESULT");
            buttonManager.disablePlayerButtons();
            ledManager.startCycling();
            buzzerManager.playWinner();
            break;
        default:
            break;
    }
}
