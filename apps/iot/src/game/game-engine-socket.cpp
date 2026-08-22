#include "game-engine.h"
#include "../buzzer/buzzer.h"
#include "../wifi/wifi-manager.h"
#include <ArduinoJson.h>

#include <sys/time.h>

void GameEngine::handleSocketEvent(const String& event, const String& payload) {
    Serial.printf("[SOCKET] Received: %s\n", event.c_str());
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

                long long startAt = doc["startAt"] | 0LL;
                if (startAt > 0) {
                    if (timeSynced) {
                        long long delayMs = startAt - getSyncedTime();
                        currentSequence.sequenceStartAt = millis() + (delayMs > 0 ? delayMs : 0);
                        Serial.printf("[DEBUG][IOT] Precision startAt=%lld, getSyncedTime=%llu, delayMs=%lld, sequenceStartAt=%lu\n", startAt, getSyncedTime(), delayMs, currentSequence.sequenceStartAt);
                    } else if (wifiManager.isTimeSynced()) {
                        struct timeval tv;
                        gettimeofday(&tv, NULL);
                        long long serverNow = (long long)tv.tv_sec * 1000LL + (long long)tv.tv_usec / 1000LL;
                        long long delayMs = startAt - serverNow;
                        currentSequence.sequenceStartAt = millis() + (delayMs > 0 ? delayMs : 0);
                        Serial.printf("[DEBUG][IOT] Fallback NTP startAt=%lld, serverNow=%lld, delayMs=%lld, sequenceStartAt=%lu\n", startAt, serverNow, delayMs, currentSequence.sequenceStartAt);
                    } else {
                        currentSequence.sequenceStartAt = millis();
                        Serial.printf("[DEBUG][IOT] No sync available, starting immediately\n");
                    }
                } else {
                    currentSequence.sequenceStartAt = millis();
                }
                
                if (currentState == GameState::WAIT_PLAYERS || currentState == GameState::ROUND_RESULT || currentState == GameState::SELECT_MODE || currentState == GameState::COUNTDOWN) {
                    changeState(GameState::SHOW_SEQUENCE);
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
    } else if (event == "time:sync:ack") {
        JsonDocument doc;
        if (!deserializeJson(doc, payload)) {
            unsigned long receiveTime = millis();
            long long clientTime = doc["clientTime"] | 0LL;
            long long serverTime = doc["serverTime"] | 0LL;
            if (clientTime > 0 && serverTime > 0) {
                long long latency = (receiveTime - clientTime) / 2;
                long long offset = serverTime - (clientTime + latency);
                if (timeSyncPings < 5) {
                    timeSyncOffsets[timeSyncPings++] = offset;
                    if (timeSyncPings == 5) {
                        for (int i = 0; i < 4; i++) {
                            for (int j = 0; j < 4 - i; j++) {
                                if (timeSyncOffsets[j] > timeSyncOffsets[j+1]) {
                                    long long temp = timeSyncOffsets[j];
                                    timeSyncOffsets[j] = timeSyncOffsets[j+1];
                                    timeSyncOffsets[j+1] = temp;
                                }
                            }
                        }
                        timeOffset = timeSyncOffsets[2];
                        timeSynced = true;
                        Serial.printf("[DEBUG][IOT] TimeSync Complete. offset=%lldms, latency=%lldms\n", timeOffset, latency);
                    } else {
                        // send next ping
                        socketClient.emit("time:sync", String("{\"clientTime\":") + millis() + "}");
                    }
                }
            }
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
    } else if (event == "system:reset") {
        Serial.println("[SOCKET] Received system:reset -> Resetting to WAIT_PLAYERS");
        buzzerManager.playReset();
        changeState(GameState::WAIT_PLAYERS);
    } else if (event == "device:sound") {
        JsonDocument doc;
        if (!deserializeJson(doc, payload)) {
            bool enabled = doc["enabled"] | true;
            buzzerManager.setMuted(!enabled);
            Serial.printf("[DEBUG][IOT] Sound %s\n", enabled ? "ENABLED" : "MUTED");
        }
    }
}
