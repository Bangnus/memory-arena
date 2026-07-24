#include "button_manager.h"
#include "../config/pins.h"

void ButtonManager::begin() {
  // TODO: Setup button pins and interrupts
  enabled_ = false;
  bufferHead_ = 0;
  bufferTail_ = 0;
}

void ButtonManager::enable() {
  enabled_ = true;
}

void ButtonManager::disable() {
  enabled_ = false;
}

bool ButtonManager::hasEvent() {
  return bufferHead_ != bufferTail_;
}

ButtonEvent ButtonManager::getNextEvent() {
  ButtonEvent event = eventBuffer_[bufferTail_];
  bufferTail_ = (bufferTail_ + 1) % 16;
  return event;
}
