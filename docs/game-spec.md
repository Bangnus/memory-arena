# Memory Arena
Version 1.0

---

# 1. Project Overview

Memory Arena is a local multiplayer IoT memory game developed for exhibitions and portfolio purposes.

The project consists of three systems:

- Frontend (Next.js)
- Backend (NestJS)
- ESP32 Firmware

The Backend is the Game Controller.

The ESP32 is the Game Terminal.

The Frontend is the Display Interface.

Only the Backend contains business logic.

---

# 2. Objective

Two players compete against each other.

The system displays a sequence of colors.

Players must remember the sequence.

After the sequence has finished displaying, both players reproduce the sequence using their own buttons.

The first player to correctly complete the sequence wins the round.

The match uses Best of 3.

---

# 3. Game Components

Hardware

- ESP32 Dev Module
- WS2812B RGB LEDs
- 8 Player Buttons
- 3 Control Buttons
- Active Buzzer

Software

- Next.js
- NestJS
- PostgreSQL
- Prisma
- Socket.IO

Authentication

LINE Login

---

# 4. Players

Maximum players

2

Each player has

LINE Account

Display Name

Avatar

Statistics

---

# 5. Difficulty

There are three difficulties.

Easy

Sequence Length

3

LED Display Speed

800ms

Medium

Sequence Length

4

LED Display Speed

500ms

Hard

Sequence Length

6

LED Display Speed

300ms

Only the backend determines the difficulty values.

---

# 6. Colors

The game uses four colors.

RED

GREEN

BLUE

YELLOW

Backend

Enum

ESP32

Integer

0 = RED

1 = GREEN

2 = BLUE

3 = YELLOW

---

# 7. Match Rules

One match contains multiple rounds.

Winner

First player to win 2 rounds.

Example

Round 1

Player 1

Win

Round 2

Player 2

Win

Round 3

Player 2

Win

Match Winner

Player 2

---

# 8. Round Flow

Create Sequence

↓

Display Sequence

↓

Hide Sequence

↓

Enable Player Input

↓

Receive Inputs

↓

Validate Inputs

↓

Determine Winner

↓

Save Round

↓

Next Round

---

# 9. Sequence Rules

The backend generates every sequence.

The ESP32 must never generate random sequences.

The sequence is sent to the ESP32.

The ESP32 displays the sequence exactly.

Example

RED

↓

GREEN

↓

BLUE

↓

YELLOW

After the sequence finishes,

player input becomes enabled.

---

# 10. Input Rules

During sequence display

All player buttons are disabled.

Every button press must be ignored.

After sequence display

Buttons become enabled.

Players may start pressing buttons.

---

# 11. Correct Input

Player presses

RED

GREEN

BLUE

YELLOW

Exactly the same order

Round completed.

---

# 12. Wrong Input

Example

Expected

RED

GREEN

BLUE

YELLOW

Player

RED

GREEN

YELLOW

Player immediately loses the round.

---

# 13. Simultaneous Correct Players

If both players complete the sequence correctly,

the winner is the player with the lower completion time.

Completion Time

Measured from

Input Enabled

↓

Last Correct Button

---

# 14. Both Players Wrong

If both players fail,

The round restarts.

A completely new random sequence is generated.

Previous sequence is discarded.

---

# 15. Timeout

If neither player finishes within the configured timeout,

Round Restart

Default timeout

15 seconds

---

# 16. Countdown

Before every round

Display

3

2

1

GO

After GO

Sequence display starts.

---

# 17. Match Finish

The match finishes when

Player 1 Score = 2

OR

Player 2 Score = 2

The backend saves

Winner

Duration

Difficulty

Round Data

Statistics

---

# 18. Auto Reset

After the result screen

Display Winner

5 seconds

↓

Automatically logout both players

↓

Delete Game Session

↓

Return to Login Screen

System becomes ready for the next players.

---

# 19. Admin Reset

Admin may reset

Current Session

Match History

Leaderboard

Statistics

The system immediately returns to

WAITING

---

# 20. Backend Authority

Only Backend may

Generate sequence

Determine winner

Calculate scores

Store database

Update leaderboard

Manage sessions

ESP32 and Frontend must never duplicate these responsibilities.

---

# 21. ESP32 Responsibilities

ESP32 is responsible for

Display LEDs

Read Buttons

Play Sounds

Measure Input Timing

Send Raw Inputs

Display Animations

Nothing more.

---

# 22. Frontend Responsibilities

Frontend is responsible for

LINE Login

Game Screen

Countdown

Realtime Status

Leaderboard

History

Admin

The frontend never calculates game results.

---

# 23. Future Expansion

The architecture must support future game modes.

Examples

Tournament

Endless

Time Attack

Mirror Mode

Co-op

No firmware modification should be required.

Only backend logic should change.

---

# 24. Core Principle

Backend

↓

Game Controller

↓

ESP32

Game Device

↓

Frontend

Display Interface

Business Logic exists only once.

Backend is always the Single Source of Truth.