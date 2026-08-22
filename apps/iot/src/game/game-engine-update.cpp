#include "game-engine.h"
#include "../buzzer/buzzer.h"
#include "../button/button-manager.h"
#include "../wifi/wifi-manager.h"
#include "../api/serial-manager.h"

void GameEngine::updateState() {
    unsigned long now = millis();
    
    if (buttonManager.isRestartPressed()) {
        Serial.println("[RESTART] Physical RESTART button pressed! Triggering system:reset...");
        buzzerManager.playReset();
        socketClient.sendSystemReset();
        serialManager.sendRestart();
        changeState(GameState::WAIT_PLAYERS);
        return;
    }

    switch (currentState) {
        case GameState::BOOT: {
#ifdef HARDWARE_MODE
            if (String(HARDWARE_MODE) == "USB") {
                Serial.println("[BOOT] USB Mode detected. Skipping network boot checks. Transitioning to WAIT_PLAYERS.");
                changeState(GameState::WAIT_PLAYERS);
                break;
            }
#endif
            static unsigned long lastBootCheck = 0;
            static unsigned long bootStart = millis();
            if (now - lastBootCheck < 2000) break;
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
            } else if (now - bootStart > 5000) {
                Serial.println("[BOOT] Wi-Fi or API check timed out. Proceeding to WAIT_PLAYERS for USB Serial Mode.");
                changeState(GameState::WAIT_PLAYERS);
            }
            break;
        }
        case GameState::SELECT_MODE:
            handleSelectMode();
            if (!socketClient.isConnected()) pollBackend();
            break;
        case GameState::WAIT_PLAYERS:
            if (buttonManager.isStartPressed() && (now - lastButtonTime >= 500)) {
                lastButtonTime = now;
                socketClient.signalStart();
                serialManager.sendButtonPress("START");
                changeState(GameState::SELECT_MODE);
            }
            if (!socketClient.isConnected()) pollBackend();
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
