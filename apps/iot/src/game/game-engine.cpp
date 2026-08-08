#include "game-engine.h"
#include "../led/led-manager.h"
#include "../buzzer/buzzer.h"
#include "../button/button-manager.h"
#include "../wifi/wifi-manager.h"
#include <ArduinoJson.h>
#include <time.h>

GameEngine gameEngine;

// Static callback for socket events
void onSocketEvent(const String& event, const String& payload) {
    gameEngine.handleSocketEvent(event, payload);
}

void GameEngine::init() {
    // Initialize socket client with event handler
    socketClient.onEvent(onSocketEvent);
    socketClient.init();
    
    changeState(GameState::BOOT);
}

void GameEngine::handleSocketEvent(const String& event, const String& payload) {
    // Store event for processing in main loop (thread-safe)
    pendingEvent = event;
    pendingPayload = payload;
    hasPendingEvent = true;
    
    Serial.printf("[SOCKET] Received: %s\n", event.c_str());
}

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
            buzzerManager.play(BuzzerSound::BEEP);
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
            buzzerManager.playInputReady(); // Double beep — signals "buttons active"
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

void GameEngine::pollBackend() {
    unsigned long now = millis();
    // Poll faster during critical transitions (WAIT_PLAYERS, ROUND_RESULT)
    unsigned long pollInterval = (currentState == GameState::WAIT_PLAYERS || 
                                   currentState == GameState::ROUND_RESULT) 
                                  ? 500 : 2000;
    if (now - lastPollTime >= pollInterval) {
        lastPollTime = now;
        
        // Keep socket alive during HTTP call
        socketClient.loop();
        
        GameStateData state;
        if (apiClient.getCurrentState(state)) {
            currentSessionId = state.id; // Store session ID
            currentRound = state.round;

            if ((state.status == "COUNTDOWN" || state.status == "READY") && 
                currentState != GameState::COUNTDOWN && 
                currentState != GameState::SHOW_SEQUENCE && 
                currentState != GameState::PLAYER_INPUT) {
                changeState(GameState::COUNTDOWN);
            } else if (state.status == "SHOW_SEQUENCE" && currentState == GameState::ROUND_RESULT) {
                changeState(GameState::COUNTDOWN);
            } else if (state.status == "WAITING" && currentState != GameState::WAIT_PLAYERS && currentState != GameState::SELECT_MODE) {
                changeState(GameState::WAIT_PLAYERS);
            }
        }
        
        // Keep socket alive after HTTP call
        socketClient.loop();
    }
}

void GameEngine::loop() {
    ledManager.loop();
    buzzerManager.loop();
    wifiManager.loop();
    apiClient.loop();
    socketClient.loop();
    yield();
    
    unsigned long now = millis();
    
    // Process pending socket events
    if (hasPendingEvent) {
        String event = pendingEvent;
        String payload = pendingPayload;
        hasPendingEvent = false;
        
        // Handle game events from socket
        if (event == "device:start") {
            Serial.printf("[DEBUG][IOT][%lu] device:start received, changing to SELECT_MODE\n", millis());
            changeState(GameState::SELECT_MODE);
        } else if (event == "game:waiting") {
            // Both players ready — start non-blocking 5s countdown to sync with web
            Serial.printf("[DEBUG][IOT][%lu] game:waiting received\n", millis());
            waitingCountdownActive = true;
            waitingCountdownStep = 5;
            lastWaitingCountdownTime = now;
            buzzerManager.play(BuzzerSound::BEEP);
            waitingCountdownStep--;
        } else if (event == "countdown:start") {
            Serial.printf("[DEBUG][IOT][%lu] countdown:start received, currentState=%d\n", millis(), (int)currentState);
            if (currentState != GameState::COUNTDOWN && 
                currentState != GameState::SHOW_SEQUENCE && 
                currentState != GameState::PLAYER_INPUT) {
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

                    // Convert absolute startAt (server Date.now()) to relative millis() timestamp
                    if (wifiManager.isTimeSynced()) {
                        long long startAt = doc["startAt"] | 0LL;
                        time_t now;
                        time(&now);
                        long long serverNow = (long long)now * 1000;
                        long long delayMs = startAt - serverNow;
                        currentSequence.sequenceStartAt = millis() + (delayMs > 0 ? delayMs : 0);
                        Serial.printf("[DEBUG][IOT][%lu] startAt=%lld, serverNow=%lld, delayMs=%lld, sequenceStartAt=%lu\n", millis(), startAt, serverNow, delayMs, currentSequence.sequenceStartAt);
                    } else {
                        currentSequence.sequenceStartAt = millis();
                        Serial.printf("[DEBUG][IOT][%lu] NTP not synced, starting immediately\n", millis());
                    }
                    
                    Serial.printf("[DEBUG][IOT][%lu] sequence stored: len=%d, speed=%dms, startAt=%lu\n", millis(), currentSequence.length, currentSequence.displaySpeed, currentSequence.sequenceStartAt);
                    
                    if (currentState == GameState::WAIT_PLAYERS || 
                        currentState == GameState::ROUND_RESULT) {
                        changeState(GameState::COUNTDOWN);
                    }
                }
            }
        } else if (event == "session:update") {
            JsonDocument doc;
            DeserializationError error = deserializeJson(doc, payload);
            if (!error) {
                String sessionId = doc["id"].as<String>();
                if (sessionId.length() > 0) {
                    currentSessionId = sessionId;
                }
                int round = doc["currentRound"] | 1;
                currentRound = round;
            }
        } else if (event == "round:result") {
            JsonDocument doc;
            DeserializationError error = deserializeJson(doc, payload);
            if (!error) {
                bool matchFinished = doc["matchFinished"] | false;
                int nextRound = doc["nextRound"] | 0;
                if (matchFinished) {
                    changeState(GameState::GAME_RESULT);
                } else {
                    // Update round and wait for next sequence
                    if (nextRound > 0) currentRound = nextRound;
                    changeState(GameState::ROUND_RESULT);
                }
            }
        } else if (event == "match:result") {
            changeState(GameState::GAME_RESULT);
        }
    }

    // Process waiting countdown (non-blocking 5s sync with web)
    handleWaitingCountdown();

    switch (currentState) {
        case GameState::BOOT: {
            static unsigned long lastBootCheck = 0;
            unsigned long now = millis();
            if (now - lastBootCheck < 2000) break; // Check every 2 seconds only
            lastBootCheck = now;
            
            if (wifiManager.isConnected() && apiClient.checkBackendStatus()) {
                GameStateData state;
                if (apiClient.getCurrentState(state) && state.id.length() > 0) {
                    if (state.status == "COUNTDOWN" || state.status == "READY") {
                        changeState(GameState::COUNTDOWN);
                    } else if (state.status == "SHOW_SEQUENCE") {
                        changeState(GameState::SHOW_SEQUENCE);
                    } else {
                        changeState(GameState::WAIT_PLAYERS);
                    }
                } else {
                    changeState(GameState::WAIT_PLAYERS);
                }
            }
            break;
        }
        case GameState::SELECT_MODE:
            handleSelectMode();
            if (!socketClient.isConnected()) {
                pollBackend();
            }
            break;
        case GameState::WAIT_PLAYERS:
            if (buttonManager.isStartPressed() && (now - lastButtonTime >= 500)) {
                lastButtonTime = now;
                buzzerManager.playGameStart(); // Rising 3-note game start sound
                socketClient.signalStart();
                changeState(GameState::SELECT_MODE);
            }
            // Fallback: poll via HTTP when socket disconnected
            if (!socketClient.isConnected()) {
                pollBackend();
            }
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

void GameEngine::handleSelectMode() {
    unsigned long now = millis();
    if (now - lastButtonTime < 200) return;

    if (buttonManager.isNextPressed()) {
        lastButtonTime = now;
        selectedMode = (selectedMode + 1) % 3;
        Serial.printf("[DEBUG][IOT] Button NEXT (pin %d) pressed. Changed mode to: %s (%d)\n", PIN_BTN_NEXT, modes[selectedMode], selectedMode);
        buzzerManager.play(BuzzerSound::BEEP);
        socketClient.signalModeChange(selectedMode);
    }

    if (buttonManager.isPrevPressed()) {
        lastButtonTime = now;
        selectedMode = (selectedMode + 2) % 3;
        Serial.printf("[DEBUG][IOT] Button PREV (pin %d) pressed. Changed mode to: %s (%d)\n", PIN_BTN_PREV, modes[selectedMode], selectedMode);
        buzzerManager.play(BuzzerSound::BEEP);
        socketClient.signalModeChange(selectedMode);
    }

    if (buttonManager.isStartPressed()) {
        lastButtonTime = now;
        buzzerManager.playCorrect();
        Serial.printf("[MODE] Selected: %s\n", modes[selectedMode]);
        socketClient.setDifficulty(modes[selectedMode]);
    }
}

void GameEngine::handleWaitingCountdown() {
    if (!waitingCountdownActive) return;

    unsigned long now = millis();
    if (now - lastWaitingCountdownTime >= 1000) {
        lastWaitingCountdownTime = now;
        if (waitingCountdownStep > 0) {
            Serial.printf("[DEBUG][IOT][%lu] waiting countdown: %d\n", now, waitingCountdownStep);
            buzzerManager.play(BuzzerSound::BEEP);
            waitingCountdownStep--;
        } else {
            Serial.printf("[DEBUG][IOT][%lu] waiting countdown complete, playGameStart\n", now);
            buzzerManager.playGameStart();
            waitingCountdownActive = false;
        }
    }
}

void GameEngine::handleCountdown() {
    unsigned long now = millis();
    
    if (now - lastCountdownTime >= 1000) {
        lastCountdownTime = now;
        if (countdownStep > 0) {
            Serial.printf("[DEBUG][IOT][%lu] countdown: %d\n", now, countdownStep);
            if (!waitingCountdownActive) {
                buzzerManager.play(BuzzerSound::BEEP);
            }
            countdownStep--;
        } else {
            if (waitingCountdownActive) return;
            Serial.printf("[DEBUG][IOT][%lu] countdown complete -> SHOW_SEQUENCE\n", now);
            buzzerManager.playCorrect();
            changeState(GameState::SHOW_SEQUENCE);
        }
    }
}

void GameEngine::handleShowSequence() {
    unsigned long now = millis();
    
    // Check if we have sequence data, fallback to HTTP if not
    if (!sequenceFetched) {
        if (currentSequence.length == 0) {
            socketClient.loop();
            GameSequenceData seq;
            if (apiClient.getSequence(seq)) {
                currentSequence = seq;
                // REST fallback: convert relative startInMs to millis() timestamp
                if (currentSequence.sequenceStartAt == 0 && currentSequence.startInMs > 0) {
                    currentSequence.sequenceStartAt = millis() + currentSequence.startInMs;
                    Serial.printf("[DEBUG][IOT][%lu] REST fallback: startInMs=%d, sequenceStartAt=%lu\n", millis(), currentSequence.startInMs, currentSequence.sequenceStartAt);
                }
            }
            socketClient.loop();
            if (currentSequence.length == 0) return;
        }
        // If no startAt was set (no NTP, no REST), start immediately
        if (currentSequence.sequenceStartAt == 0) {
            currentSequence.sequenceStartAt = millis();
            Serial.printf("[DEBUG][IOT][%lu] no startAt set, starting immediately\n", millis());
        }
        sequenceFetched = true;
        lastSequenceDisplayTime = now;
        Serial.printf("[DEBUG][IOT][%lu] sequence fetched: len=%d, speed=%dms, startAt=%lu, now=%lu, wait=%lums\n", millis(), currentSequence.length, currentSequence.displaySpeed, currentSequence.sequenceStartAt, now, currentSequence.sequenceStartAt > now ? currentSequence.sequenceStartAt - now : 0);
        return;
    }

    // Wait until synchronized start time before displaying
    if (now < currentSequence.sequenceStartAt) {
        static unsigned long lastWaitLog = 0;
        if (now - lastWaitLog >= 500) {
            Serial.printf("[DEBUG][IOT][%lu] waiting for startAt=%lu, remaining=%lums\n", now, currentSequence.sequenceStartAt, currentSequence.sequenceStartAt - now);
            lastWaitLog = now;
        }
        return;
    }
    
    unsigned long speed = currentSequence.displaySpeed > 0 ? currentSequence.displaySpeed : 500;
    
    if (now - lastSequenceDisplayTime >= speed) {
        lastSequenceDisplayTime = now;
        
        if (sequenceDisplayIndex < currentSequence.length) {
            String colorStr = currentSequence.sequence[sequenceDisplayIndex];
            LedColor color = LedColor::NONE;
            if (colorStr == "RED") color = LedColor::RED;
            else if (colorStr == "BLUE") color = LedColor::BLUE;
            
            Serial.printf("[DEBUG][IOT][%lu] LED step %d/%d: %s\n", millis(), sequenceDisplayIndex + 1, currentSequence.length, colorStr.c_str());
            ledManager.turnOn(color);
            buzzerManager.play(BuzzerSound::BEEP);
            sequenceDisplayIndex++;
        } else {
            Serial.printf("[DEBUG][IOT][%lu] sequence display complete, entering PLAYER_INPUT\n", millis());
            ledManager.turnOffAll();
            changeState(GameState::PLAYER_INPUT);
        }
    } else if (now - lastSequenceDisplayTime >= (speed * 65) / 100) {
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
            // Send via socket (non-blocking)
            socketClient.sendButtonPress(isP1 ? 1 : 2, colorStr);
            buzzerManager.playButtonPress();
            
            if (isP1 && !p1Finished) {
                if (p1Input.length < currentSequence.length) {
                    p1Input.inputs[p1Input.length++] = colorStr;
                    if (p1Input.length == currentSequence.length) {
                        p1Input.time = millis() - inputStartTime;
                        p1Finished = true;
                        Serial.printf("[P1] Done in %lu ms\n", p1Input.time);
                    }
                }
            } else if (!isP1 && !p2Finished) {
                if (p2Input.length < currentSequence.length) {
                    p2Input.inputs[p2Input.length++] = colorStr;
                    if (p2Input.length == currentSequence.length) {
                        p2Input.time = millis() - inputStartTime;
                        p2Finished = true;
                        Serial.printf("[P2] Done in %lu ms\n", p2Input.time);
                    }
                }
            }
        }
    }
    
    if (millis() - inputStartTime > INPUT_TIMEOUT_MS && (!p1Finished || !p2Finished)) {
        Serial.println("[INPUT] Timeout!");
        p1Finished = true;
        p2Finished = true;
    }
    
    if (p1Finished && p2Finished) {
        // Build JSON arrays for inputs
        String p1Json = "[";
        for (int i = 0; i < p1Input.length; i++) {
            if (i > 0) p1Json += ",";
            p1Json += "\"" + p1Input.inputs[i] + "\"";
        }
        p1Json += "]";
        
        String p2Json = "[";
        for (int i = 0; i < p2Input.length; i++) {
            if (i > 0) p2Json += ",";
            p2Json += "\"" + p2Input.inputs[i] + "\"";
        }
        p2Json += "]";
        
        // Submit via socket (non-blocking, gets result via socket event)
        socketClient.submitInput(currentSessionId, currentRound, 
                                 p1Json, p1Input.time, p2Json, p2Input.time);
        
        // For now, transition based on local data
        // Backend will emit round:result or match:result via socket
        Serial.printf("[RESULT] R%d P1:%dms P2:%dms\n", 
            currentRound, p1Input.time, p2Input.time);
        changeState(GameState::ROUND_RESULT);
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
