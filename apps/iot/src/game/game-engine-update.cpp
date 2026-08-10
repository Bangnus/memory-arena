#include "game-engine.h"
#include "../buzzer/buzzer.h"
#include "../button/button-manager.h"
#include "../wifi/wifi-manager.h"

void GameEngine::updateState() {
    unsigned long now = millis();
    
    if (buttonManager.isRestartPressed()) {
        Serial.println("[RESTART] Physical RESTART button pressed! Triggering system:reset...");
        buzzerManager.playReset();
        socketClient.sendSystemReset();
        changeState(GameState::WAIT_PLAYERS);
        return;
    }

    switch (currentState) {
        case GameState::BOOT: {
            static unsigned long lastBootCheck = 0;
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
                buzzerManager.playGameStart();
                socketClient.signalStart();
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
