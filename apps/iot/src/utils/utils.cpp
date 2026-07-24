#include "utils.h"
#include "../config/constants.h"

unsigned long debounce(unsigned long lastTime, unsigned long delay) {
  unsigned long now = millis();
  if (now - lastTime >= delay) {
    return now;
  }
  return lastTime;
}

bool isValidSequence(const uint8_t* sequence, uint8_t length) {
  for (uint8_t i = 0; i < length; i++) {
    if (sequence[i] > 3) return false;
  }
  return true;
}

uint32_t colorFromHex(uint32_t hex) {
  return hex;
}
