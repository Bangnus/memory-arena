#pragma once

// Firmware
constexpr const char* FIRMWARE_VERSION = "1.0.0";

// Device — overridden by build flags from .env when available
#ifdef IOT_DEVICE_ID
constexpr const char* DEVICE_ID = IOT_DEVICE_ID;
#else
constexpr const char* DEVICE_ID = "ESP32-001";
#endif

// WiFi
#ifdef IOT_WIFI_SSID
constexpr const char* WIFI_SSID = IOT_WIFI_SSID;
#else
constexpr const char* WIFI_SSID = "natanee1_2.4G";
#endif

#ifdef IOT_WIFI_PASSWORD
constexpr const char* WIFI_PASSWORD = IOT_WIFI_PASSWORD;
#else
constexpr const char* WIFI_PASSWORD = "natanee1";
#endif

// Backend
#ifdef IOT_BACKEND_HOST
constexpr const char* BACKEND_HOST = IOT_BACKEND_HOST;
#else
constexpr const char* BACKEND_HOST = "192.168.0.10";
#endif

#ifdef IOT_BACKEND_PORT
constexpr const int BACKEND_PORT = IOT_BACKEND_PORT;
#else
constexpr const int BACKEND_PORT = 3000;
#endif

#ifdef IOT_BACKEND_URL
constexpr const char* BACKEND_URL = IOT_BACKEND_URL;
#else
constexpr const char* BACKEND_URL = "http://192.168.0.10:3000/api/v1";
#endif

#ifdef IOT_DEVICE_KEY
constexpr const char* DEVICE_KEY = IOT_DEVICE_KEY;
#else
constexpr const char* DEVICE_KEY = "memory-battle-device-001";
#endif
