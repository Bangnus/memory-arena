#include "game-engine.h"
#include "../buzzer/buzzer.h"
#include "../wifi/wifi-manager.h"
#include <ArduinoJson.h>

void GameEngine::handleSocketEvent(const String& event, const String& payload) {
    pendingEvent = event;
    pendingPayload = payload;
    hasPendingEvent = true;
    Serial.printf("[SOCKET] Received: %s\n", event.c_str());
}

void GameEngine::processSocketEvents() {
    if (!hasPendingEvent) return;
    String event = pendingEvent;
    String payload = pendingPayload;
    hasPendingEvent = false;
    unsigned long now = millis();
    
    if (event == "device:start") {
        Serial.printf("[DEBUG][IOT][%lu] device:start received, changing to SELECT_MODE\n", millis());
        changeState(GameState::SELECT_MODE);
    } else if (event == "game:waiting") {
        Serial.printf("[DEBUG][IOT][%lu] game:waiting received\n", millis());
        waitingCountdownActive = true;
        waitingCountdownStep = 5;
        lastWaitingCountdownTime = now;
        buzzerManager.play(BuzzerSound::BEEP);
        waitingCountdownStep--;
    } else if (event == "countdown:start") {
        Serial.printf("[DEBUG][IOT][%lu] countdown:start received, currentState=%d\n", millis(), (int)currentState);
        if (currentState != GameState::COUNTDOWN && currentState != GameState::SHOW_SEQUENCE && currentState != GameState::PLAYER_INPUT) {
            changeState(GameState::COUNTDOWN);
        }
    } else if (event == "sequence:show") {
        Serial.printf("[DEBUG][IOT][%lu] sequence:show received\n", millis());
        JsonDocument doc;
        DeserializationError error = deserializeJson(doc, payload);
        if (!error) {
            JsonArray arr = doc["sequence"].as<JsonArray>();
            if (!arr.isNull()) {
                currentSequence.length = 0;
                for (JsonVariant v : arr) {
                    if (currentSequence.length < MAX_SEQUENCE_LENGTH) {
                        currentSequence.sequence[currentSequence.length++] = v.as<String>();
                    }
                }
                currentSequence.displaySpeed = doc["displaySpeed"] | 500;
                currentSequence.sessionId = doc["sessionId"].as<String>();
                currentRound = doc["round"] | 1;

                if (wifiManager.isTimeSynced()) {
                    long long startAt = doc["startAt"] | 0LL;
                    time_t nowTime;
                    time(&nowTime);
                    long long delayMs = startAt - ((long long)nowTime * 1000);
                    currentSequence.sequenceStartAt = millis() + (delayMs > 0 ? delayMs : 0);
                } else {
                    currentSequence.sequenceStartAt = millis();
                }
                
                if (currentState == GameState::WAIT_PLAYERS || currentState == GameState::ROUND_RESULT) {
                    changeState(GameState::COUNTDOWN);
                }
            }
        }
    } else if (event == "session:update") {
        JsonDocument doc;
        if (!deserializeJson(doc, payload)) {
            String sessionId = doc["id"].as<String>();
            if (sessionId.length() > 0) currentSessionId = sessionId;
            currentRound = doc["currentRound"] | 1;
        }
    } else if (event == "round:result") {
        JsonDocument doc;
        if (!deserializeJson(doc, payload)) {
            if (doc["matchFinished"] | false) {
                changeState(GameState::GAME_RESULT);
            } else {
                int nextRound = doc["nextRound"] | 0;
                if (nextRound > 0) currentRound = nextRound;
                changeState(GameState::ROUND_RESULT);
            }
        }
    } else if (event == "match:result") {
        changeState(GameState::GAME_RESULT);
    }
}
