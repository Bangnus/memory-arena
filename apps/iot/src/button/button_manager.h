#ifndef BUTTON_MANAGER_H
#define BUTTON_MANAGER_H

#include <Arduino.h>

struct ButtonEvent {
  uint8_t player;  // 1 or 2
  uint8_t color;   // 0=RED, 1=BLUE, 2=GREEN, 3=YELLOW
  unsigned long timestamp;
};

class ButtonManager {
public:
  void begin();
  void enable();
  void disable();
  bool hasEvent();
  ButtonEvent getNextEvent();

private:
  bool enabled_;
  ButtonEvent eventBuffer_[16];
  uint8_t bufferHead_;
  uint8_t bufferTail_;
  static void IRAM_ATTR buttonISR0();
  static void IRAM_ATTR buttonISR1();
  // ... more ISRs
};

#endif // BUTTON_MANAGER_H
