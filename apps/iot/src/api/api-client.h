#pragma once

#include <Arduino.h>
#include <ArduinoJson.h>
#include "../config/constants.h"

struct GameStateData {
    String id;
    String status;
    String difficulty;
    int round;
    int startInMs; // Relative ms to wait before sequence starts
};

struct GameSequenceData {
    String sessionId;
    int round;
    int displaySpeed;
    String sequence[MAX_SEQUENCE_LENGTH];
    int length;
    int startInMs; // Relative ms to wait before sequence starts
};

struct PlayerInputData {
    String inputs[MAX_SEQUENCE_LENGTH];
    int length;
    int time;
};

struct RoundResultData {
    int roundWinner;
    int player1Score;
    int player2Score;
    bool matchFinished;
    int nextRound;
};

class ApiClient {
public:
    void init();
    void loop();
    
    bool checkBackendStatus();
    
    bool getCurrentState(GameStateData& state);
    bool getSequence(GameSequenceData& seq);
    bool submitInput(String sessionId, int round, const PlayerInputData& p1, const PlayerInputData& p2, RoundResultData& res);
    bool startGame();
    bool signalStart();
    bool signalModeChange(int mode);
    bool setDifficulty(const char* difficulty);
    void sendButtonPress(int playerNumber, const String& color);

private:
    unsigned long lastHeartbeat = 0;
    void sendHeartbeat();
    
    String httpGet(const char* endpoint);
    String httpPost(const char* endpoint, const String& payload);
};

extern ApiClient apiClient;
