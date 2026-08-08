#include "game-engine.h"
#include "../buzzer/buzzer.h"
#include "../wifi/wifi-manager.h"
#include <ArduinoJson.h>

#include <sys/time.h>

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
        JsonDocument doc;
        deserializeJson(doc, payload);
        waitingCountdownStep = doc["countdown"] | 5;
        waitingCountdownActive = true;
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
        Serial.printf("[DEBUG][IOT] Payload: %s\n", payload.c_str());
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

                long startInMs = doc["startInMs"] | -1;
                if (startInMs >= 0) {
                    currentSequence.sequenceStartAt = millis() + startInMs;
                    Serial.printf("[DEBUG][IOT] Using relative startInMs=%ld, sequenceStartAt=%lu\n", startInMs, currentSequence.sequenceStartAt);
                } else if (wifiManager.isTimeSynced()) {
                    long long startAt = doc["startAt"] | 0LL;
                    struct timeval tv;
                    gettimeofday(&tv, NULL);
                    long long serverNow = (long long)tv.tv_sec * 1000LL + (long long)tv.tv_usec / 1000LL;
                    long long delayMs = startAt - serverNow;
                    currentSequence.sequenceStartAt = millis() + (delayMs > 0 ? delayMs : 0);
                    Serial.printf("[DEBUG][IOT] Precision startAt=%lld, serverNow=%lld, delayMs=%lld, sequenceStartAt=%lu\n", startAt, serverNow, delayMs, currentSequence.sequenceStartAt);
                } else {
                    currentSequence.sequenceStartAt = millis();
                    Serial.printf("[DEBUG][IOT] NTP not synced, starting immediately\n");
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
