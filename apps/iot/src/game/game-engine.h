#pragma once

#include <Arduino.h>
#include "../config/constants.h"
#include "../api/api-client.h"

class GameEngine {
public:
    void init();
    void loop();

private:
    GameState currentState = GameState::BOOT;
    unsigned long stateStartTime = 0;
    unsigned long lastPollTime = 0;
    
    String currentSessionId = "";
    int currentRound = 1;
    GameSequenceData currentSequence;
    
    PlayerInputData p1Input;
    PlayerInputData p2Input;
    unsigned long inputStartTime = 0;
    bool p1Finished = false;
    bool p2Finished = false;
    
    int sequenceDisplayIndex = 0;
    unsigned long lastSequenceDisplayTime = 0;
    
    int countdownStep = 3;
    unsigned long lastCountdownTime = 0;
    
    void changeState(GameState newState);
    void pollBackend();
    
    void handleCountdown();
    void handleShowSequence();
    void handlePlayerInput();
    void handleRoundResult();
    void handleMatchResult();
};

extern GameEngine gameEngine;
