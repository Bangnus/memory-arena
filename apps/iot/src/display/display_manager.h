#ifndef DISPLAY_MANAGER_H
#define DISPLAY_MANAGER_H

#include <Arduino.h>

class DisplayManager {
public:
  DisplayManager();
  void begin();
  void showText(const char* text);
  void showNumber(uint8_t number);
  void clear();

private:
  // TODO: Add display hardware support
};

#endif // DISPLAY_MANAGER_H
