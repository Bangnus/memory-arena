#ifndef GAME_ENGINE_H
#define GAME_ENGINE_H

#include <Arduino.h>
#include "../config/constants.h"
#include "../button/button_manager.h"
#include "../led/led_manager.h"
#include "../buzzer/buzzer_manager.h"
#include "../api/api_client.h"

class GameEngine {
public:
  GameEngine(ButtonManager& buttonMgr, LedManager& ledMgr,
             BuzzerManager& buzzerMgr, ApiClient& apiClient);
  void begin();
  void update();
  GameState getState();
  void setState(GameState newState);

private:
  GameState currentState_;
  ButtonManager& buttonMgr_;
  LedManager& ledMgr_;
  BuzzerManager& buzzerMgr_;
  ApiClient& apiClient_;

  uint8_t currentSequence_[16];
  uint8_t sequenceLength_;
  uint8_t playerProgress_[2];
  unsigned long stateStartTime_;

  void handleBoot();
  void handleConnectWifi();
  void handleWaitServer();
  void handleSelectMode();
  void handleWaitPlayers();
  void handleCountdown();
  void handleShowSequence();
  void handlePlayerInput();
  void handleRoundResult();
  void handleGameResult();
  void handleReset();
};

#endif // GAME_ENGINE_H
