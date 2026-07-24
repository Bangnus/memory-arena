#ifndef BUZZER_MANAGER_H
#define BUZZER_MANAGER_H

#include <Arduino.h>

class BuzzerManager {
public:
  BuzzerManager(uint8_t pin);
  void begin();
  void playBoot();
  void playCountdown();
  void playCorrect();
  void playWrong();
  void playWinner();
  void playReset();

private:
  uint8_t pin_;
  void playTone(uint16_t frequency, uint16_t duration);
};

#endif // BUZZER_MANAGER_H
