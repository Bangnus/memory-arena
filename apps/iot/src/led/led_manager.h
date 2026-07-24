#ifndef LED_MANAGER_H
#define LED_MANAGER_H

#include <Arduino.h>
#include <Adafruit_NeoPixel.h>

class LedManager {
public:
  LedManager(uint16_t numPixels, uint8_t pin);
  void begin();
  void showColor(uint32_t color, uint8_t brightness = 50);
  void showSequence(const uint8_t* sequence, uint8_t length, uint16_t delayMs);
  void showCountdown();
  void showCorrect();
  void showWrong();
  void showWinner(uint8_t player);
  void showIdle();
  void clear();

private:
  Adafruit_NeoPixel pixels_;
  uint32_t getColorFromEnum(uint8_t colorEnum);
};

#endif // LED_MANAGER_H
