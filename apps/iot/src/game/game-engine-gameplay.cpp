#include "game-engine.h"

void GameEngine::pollBackend() {
    unsigned long now = millis();
    unsigned long pollInterval = (currentState == GameState::WAIT_PLAYERS || currentState == GameState::ROUND_RESULT) ? 500 : 2000;
    
    if (now - lastPollTime >= pollInterval) {
        lastPollTime = now;
        socketClient.loop();
        
        GameStateData state;
        if (apiClient.getCurrentState(state)) {
            currentSessionId = state.id;
            currentRound = state.round;

            if ((state.status == "COUNTDOWN" || state.status == "READY") && 
                currentState != GameState::COUNTDOWN && currentState != GameState::SHOW_SEQUENCE && currentState != GameState::PLAYER_INPUT) {
                changeState(GameState::COUNTDOWN);
            } else if (state.status == "SHOW_SEQUENCE" && currentState == GameState::ROUND_RESULT) {
                changeState(GameState::COUNTDOWN);
            } else if (state.status == "WAITING" && currentState != GameState::WAIT_PLAYERS && currentState != GameState::SELECT_MODE) {
                changeState(GameState::WAIT_PLAYERS);
            }
        }
        socketClient.loop();
    }
}

void GameEngine::handleRoundResult() {
    unsigned long now = millis();
    if (now - stateStartTime >= 500) {
        pollBackend();
    }
}

void GameEngine::handleMatchResult() {
    unsigned long now = millis();
    if (now - stateStartTime >= 5000) {
        changeState(GameState::WAIT_PLAYERS);
    }
}
