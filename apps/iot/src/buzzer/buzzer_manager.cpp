#include "buzzer_manager.h"

BuzzerManager::BuzzerManager(uint8_t pin) : pin_(pin) {}

void BuzzerManager::begin() {
  pinMode(pin_, OUTPUT);
}

void BuzzerManager::playBoot() {
  // TODO: Implement boot sound
}

void BuzzerManager::playCountdown() {
  // TODO: Implement countdown sound
}

void BuzzerManager::playCorrect() {
  // TODO: Implement correct sound
}

void BuzzerManager::playWrong() {
  // TODO: Implement wrong sound
}

void BuzzerManager::playWinner() {
  // TODO: Implement winner sound
}

void BuzzerManager::playReset() {
  // TODO: Implement reset sound
}

void BuzzerManager::playTone(uint16_t frequency, uint16_t duration) {
  tone(pin_, frequency, duration);
}
