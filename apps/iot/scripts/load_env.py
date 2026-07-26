"""
PlatformIO extra script to load .env variables as build flags.

Reads the root .env file and injects IoT-relevant variables
as -D build flags so config.h can pick them up at compile time.
"""

Import("env")

import os


def load_dotenv(path):
    """Parse a .env file into a dict, ignoring comments and blank lines."""
    values = {}
    if not os.path.isfile(path):
        return values
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" not in line:
                continue
            key, _, value = line.partition("=")
            key = key.strip()
            value = value.strip()
            # strip surrounding quotes
            if len(value) >= 2 and value[0] == value[-1] and value[0] in ('"', "'"):
                value = value[1:-1]
            values[key] = value
    return values


# Resolve the root .env relative to this script (apps/iot/scripts/ -> ../../.env)
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
env_path = os.path.join(root_dir, ".env")

dotenv = load_dotenv(env_path)


def resolve_refs(value, env):
    """Replace {VAR} placeholders with values from the same env dict."""
    import re

    def replacer(match):
        return env.get(match.group(1), match.group(0))

    return re.sub(r"\{(\w+)\}", replacer, value)


# Mapping: .env key -> C++ -D flag name
ENV_MAP = {
    "LOCAL_IP": "IOT_BACKEND_HOST",
    "IOT_WIFI_SSID": "IOT_WIFI_SSID",
    "IOT_WIFI_PASSWORD": "IOT_WIFI_PASSWORD",
    "IOT_DEVICE_ID": "IOT_DEVICE_ID",
    "IOT_DEVICE_KEY": "IOT_DEVICE_KEY",
    "IOT_BACKEND_PORT": "IOT_BACKEND_PORT",
    "IOT_BACKEND_URL": "IOT_BACKEND_URL",
}

build_flags = []
for env_key, flag_name in ENV_MAP.items():
    value = dotenv.get(env_key)
    if value:
        value = resolve_refs(value, dotenv)
        build_flags.append(f'-D{flag_name}=\\"{value}\\"')

if build_flags:
    env.Append(BUILD_FLAGS=build_flags)
    print(f"[load_env] Injected {len(build_flags)} build flags from .env")
else:
    print("[load_env] No .env variables found, using config.h defaults")
