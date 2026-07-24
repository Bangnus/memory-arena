#ifndef UTILS_H
#define UTILS_H

#include <Arduino.h>

unsigned long debounce(unsigned long lastTime, unsigned long delay);
bool isValidSequence(const uint8_t* sequence, uint8_t length);
uint32_t colorFromHex(uint32_t hex);

#endif // UTILS_H
