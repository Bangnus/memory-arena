#pragma once

#include <Arduino.h>
#include "../config/constants.h"
#include "../api/api-client.h"
#include "../api/socket-client.h"

class GameEngine {
public:
    void init();
    void loop();
    void handleSocketEvent(const String& event, const String& payload);

private:
    GameState currentState = GameState::BOOT;
    unsigned long stateStartTime = 0;
    unsigned long lastPollTime = 0;
    
    long long timeOffset = 0;
    bool timeSynced = false;
    uint64_t getSyncedTime();
    unsigned long timeSyncPings = 0;
    long long timeSyncOffsets[5];

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
    bool sequenceFetched = false;

    int countdownStep = 3;
    unsigned long lastCountdownTime = 0;

    // Waiting countdown (game:waiting 5s sync with web)
    bool waitingCountdownActive = false;
    int waitingCountdownStep = 0;
    unsigned long lastWaitingCountdownTime = 0;

    // Mode selection
    int selectedMode = 0;
    const char* modes[3] = {"EASY", "MEDIUM", "HARD"};
    unsigned long lastButtonTime = 0;

    void changeState(GameState newState);
    void pollBackend();
    void updateState();

    void handleSelectMode();
    void handleWaitingCountdown();
    void handleCountdown();
    void handleShowSequence();
    void handlePlayerInput();
    void handleRoundResult();
    void handleMatchResult();
};

extern GameEngine gameEngine;
