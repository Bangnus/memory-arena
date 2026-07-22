# Memory Arena State Machine
Version 1.0

---

# Overview

The entire game is controlled by a finite state machine.

Only Backend can change states.

Frontend and ESP32 only react to state changes.

State transitions must always follow the defined flow.

No module may skip states.

---

# State Flow

BOOT

↓

WAITING

↓

PLAYER_LOGIN

↓

PLAYER_READY

↓

DIFFICULTY_SELECT

↓

COUNTDOWN

↓

SHOW_SEQUENCE

↓

PLAYER_INPUT

↓

ROUND_RESULT

↓

CHECK_MATCH

↓

MATCH_RESULT

↓

RESET

↓

WAITING

---

# BOOT

Description

Backend starts.

Actions

- Load Config
- Connect Database
- Connect Socket.IO
- Verify Environment
- Start HTTP Server

Exit

↓

WAITING

---

# WAITING

Description

Waiting for players.

Frontend

Waiting Screen

ESP32

Idle Animation

Allowed Actions

Player Login

Admin Reset

Next

↓

PLAYER_LOGIN

---

# PLAYER_LOGIN

Description

Players authenticate using LINE Login.

Requirements

Player 1

Player 2

Actions

Store Session Players

Validation

Cannot login twice.

Cannot use same LINE account twice.

Next

↓

PLAYER_READY

---

# PLAYER_READY

Description

Players confirmed.

Allowed

Difficulty Selection

Cancel Session

Next

↓

DIFFICULTY_SELECT

---

# DIFFICULTY_SELECT

Description

Select game difficulty.

Available

Easy

Medium

Hard

Rules

Difficulty cannot change after match starts.

Backend stores

Difficulty

Sequence Length

Display Speed

Next

↓

COUNTDOWN

---

# COUNTDOWN

Description

3

2

1

GO

Duration

3 seconds

Frontend

Display Countdown

ESP32

Buzzer

Countdown LEDs

Next

↓

SHOW_SEQUENCE

---

# SHOW_SEQUENCE

Description

Backend generates sequence.

ESP32 displays LEDs.

Buttons disabled.

Rules

Ignore all button presses.

Display finishes.

Next

↓

PLAYER_INPUT

---

# PLAYER_INPUT

Description

Buttons enabled.

Timer starts.

Players reproduce sequence.

Backend waits for

Player 1 Input

Player 2 Input

Timeout

Validation

Input length

Input order

Completion time

Next

↓

ROUND_RESULT

---

# ROUND_RESULT

Description

Backend validates results.

Possible Cases

Player 1 Wins

Player 2 Wins

Both Wrong

Timeout

Actions

Update Score

Save Round

Broadcast Result

Next

↓

CHECK_MATCH

---

# CHECK_MATCH

Description

Check match status.

Player Score

Player 1 = 2

↓

MATCH_RESULT

Player 2 = 2

↓

MATCH_RESULT

Otherwise

↓

COUNTDOWN

---

# MATCH_RESULT

Description

Display Winner.

Store Match.

Update Leaderboard.

Update Statistics.

Frontend

Winner Screen

ESP32

Winner Animation

Duration

5 seconds

Next

↓

RESET

---

# RESET

Description

Clear Session.

Logout Players.

Reset Scores.

Reset Current Round.

Delete Temporary Data.

Broadcast Reset.

Next

↓

WAITING

---

# Invalid Transitions

Not Allowed

WAITING

↓

MATCH_RESULT

--------------------------------

PLAYER_LOGIN

↓

SHOW_SEQUENCE

--------------------------------

COUNTDOWN

↓

MATCH_RESULT

--------------------------------

SHOW_SEQUENCE

↓

RESET

--------------------------------

PLAYER_INPUT

↓

WAITING

--------------------------------

RESET

↓

PLAYER_INPUT

---

# Timeout Rules

Player Login

120 seconds

↓

Reset Session

--------------------------------

Difficulty Selection

60 seconds

↓

Reset Session

--------------------------------

Player Input

15 seconds

↓

Round Restart

--------------------------------

Winner Screen

5 seconds

↓

Reset

---

# State Ownership

Backend

All States

Frontend

Read Only

ESP32

Read Only

---

# Events

BOOT

↓

system:ready

WAITING

↓

session:waiting

PLAYER_LOGIN

↓

player:joined

PLAYER_READY

↓

players:ready

DIFFICULTY_SELECT

↓

difficulty:selected

COUNTDOWN

↓

countdown:start

SHOW_SEQUENCE

↓

sequence:show

PLAYER_INPUT

↓

input:enabled

ROUND_RESULT

↓

round:finished

MATCH_RESULT

↓

match:finished

RESET

↓

system:reset

---

# Error Recovery

WiFi Lost

↓

Pause Session

↓

Reconnect

↓

Continue

Backend Crash

↓

Restore Session

↓

Continue

ESP32 Lost

↓

Pause Match

↓

Reconnect

↓

Continue

---

# AI Instructions

Never bypass the state machine.

Never manually set game states.

Every transition must be validated.

GameEngineService is the only component allowed to change states.

Controllers never modify states.

ESP32 and Frontend always synchronize with Backend state.