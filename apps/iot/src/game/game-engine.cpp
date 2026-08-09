#include "game-engine.h"
#include "../led/led-manager.h"
#include "../buzzer/buzzer.h"
#include "../button/button-manager.h"
#include "../wifi/wifi-manager.h"

GameEngine gameEngine;

void onSocketEvent(const String& event, const String& payload) {
    gameEngine.handleSocketEvent(event, payload);
}

void GameEngine::init() {
    socketClient.onEvent(onSocketEvent);
    socketClient.init();
    changeState(GameState::BOOT);
}

void GameEngine::loop() {
    ledManager.loop();
    buzzerManager.loop();
    wifiManager.loop();
    apiClient.loop();
    socketClient.loop();
    yield();
    
    processSocketEvents();
    handleWaitingCountdown();
    updateState();
}

uint64_t GameEngine::getSyncedTime() {
    return (uint64_t)millis() + timeOffset;
}
