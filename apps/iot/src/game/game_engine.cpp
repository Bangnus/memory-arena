#include "game_engine.h"

GameEngine::GameEngine(ButtonManager& buttonMgr, LedManager& ledMgr,
                       BuzzerManager& buzzerMgr, ApiClient& apiClient)
  : buttonMgr_(buttonMgr), ledMgr_(ledMgr), buzzerMgr_(buzzerMgr), apiClient_(apiClient) {}

void GameEngine::begin() {
  currentState_ = GameState::BOOT;
  stateStartTime_ = millis();
}

void GameEngine::update() {
  switch (currentState_) {
    case GameState::BOOT: handleBoot(); break;
    case GameState::CONNECT_WIFI: handleConnectWifi(); break;
    case GameState::WAIT_SERVER: handleWaitServer(); break;
    case GameState::SELECT_MODE: handleSelectMode(); break;
    case GameState::WAIT_PLAYERS: handleWaitPlayers(); break;
    case GameState::COUNTDOWN: handleCountdown(); break;
    case GameState::SHOW_SEQUENCE: handleShowSequence(); break;
    case GameState::PLAYER_INPUT: handlePlayerInput(); break;
    case GameState::ROUND_RESULT: handleRoundResult(); break;
    case GameState::GAME_RESULT: handleGameResult(); break;
    case GameState::RESET: handleReset(); break;
  }
}

GameState GameEngine::getState() {
  return currentState_;
}

void GameEngine::setState(GameState newState) {
  currentState_ = newState;
  stateStartTime_ = millis();
}

void GameEngine::handleBoot() {
  // TODO: Implement boot sequence
}

void GameEngine::handleConnectWifi() {
  // TODO: Implement WiFi connection
}

void GameEngine::handleWaitServer() {
  // TODO: Implement server wait
}

void GameEngine::handleSelectMode() {
  // TODO: Implement mode selection
}

void GameEngine::handleWaitPlayers() {
  // TODO: Implement player wait
}

void GameEngine::handleCountdown() {
  // TODO: Implement countdown
}

void GameEngine::handleShowSequence() {
  // TODO: Implement sequence display
}

void GameEngine::handlePlayerInput() {
  // TODO: Implement player input handling
}

void GameEngine::handleRoundResult() {
  // TODO: Implement round result
}

void GameEngine::handleGameResult() {
  // TODO: Implement game result
}

void GameEngine::handleReset() {
  // TODO: Implement reset
}
