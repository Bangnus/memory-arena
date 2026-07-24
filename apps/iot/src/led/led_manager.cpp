#include "led_manager.h"
#include "../config/constants.h"

LedManager::LedManager(uint16_t numPixels, uint8_t pin)
  : pixels_(numPixels, pin, NEO_GRB + NEO_KHZ800) {}

void LedManager::begin() {
  pixels_.begin();
  pixels_.show();
}

void LedManager::showColor(uint32_t color, uint8_t brightness) {
  pixels_.setBrightness(brightness);
  for (uint16_t i = 0; i < pixels_.numPixels(); i++) {
    pixels_.setPixelColor(i, color);
  }
  pixels_.show();
}

void LedManager::showSequence(const uint8_t* sequence, uint8_t length, uint16_t delayMs) {
  // TODO: Implement sequence display
}

void LedManager::showCountdown() {
  // TODO: Implement countdown animation
}

void LedManager::showCorrect() {
  // TODO: Implement correct animation
}

void LedManager::showWrong() {
  // TODO: Implement wrong animation
}

void LedManager::showWinner(uint8_t player) {
  // TODO: Implement winner animation
}

void LedManager::showIdle() {
  // TODO: Implement idle animation
}

void LedManager::clear() {
  showColor(COLOR_OFF);
}

uint32_t LedManager::getColorFromEnum(uint8_t colorEnum) {
  switch (colorEnum) {
    case 0: return COLOR_RED;
    case 1: return COLOR_BLUE;
    case 2: return COLOR_GREEN;
    case 3: return COLOR_YELLOW;
    default: return COLOR_OFF;
  }
}
