# Database Specification
Version 1.0

---

# Database

PostgreSQL

ORM

Prisma ORM

Primary Key

CUID

Time Zone

UTC

Naming Convention

Tables

PascalCase

Columns

camelCase

Enums

UPPER_SNAKE_CASE

---

# Design Principles

The database must be normalized.

Avoid duplicated data.

Leaderboard must be calculated from match history.

Statistics must be calculated from match history.

Do not store calculated values unless necessary.

The Backend is the only system allowed to write to the database.

---

# Entity Relationship Diagram

Player

1

↓

∞

MatchPlayer

∞

↓

1

Match

↓

∞

Round

GameSession

Independent

Only one active session is allowed.

---

# Table

Player

Purpose

Store player information from LINE Login.

Columns

id

Type

String

Primary Key

Default

cuid()

------------------------------------------------

lineUserId

Type

String

Unique

Required

------------------------------------------------

displayName

Type

String

Required

------------------------------------------------

pictureUrl

Type

String

Nullable

------------------------------------------------

createdAt

DateTime

Default now()

------------------------------------------------

updatedAt

DateTime

UpdatedAt

------------------------------------------------

Relation

MatchPlayer[]

Indexes

lineUserId UNIQUE

---

# Table

GameSession

Purpose

Store the current game.

Only one active session.

Columns

id

String

Primary Key

status

SessionStatus

difficulty

Difficulty

player1Id

String?

player2Id

String?

currentRound

Int

Default 1

player1Score

Int

Default 0

player2Score

Int

Default 0

createdAt

DateTime

updatedAt

DateTime

Indexes

status

Notes

Deleted automatically after match finishes.

---

# Table

Match

Purpose

Store completed matches.

Columns

id

Primary Key

difficulty

Difficulty

winnerId

String

Nullable

durationMs

Int

player1Score

Int

player2Score

Int

startedAt

DateTime

finishedAt

DateTime

createdAt

DateTime

Relations

Round[]

MatchPlayer[]

Winner

Player

Indexes

winnerId

createdAt

difficulty

---

# Table

Round

Purpose

Store every round.

Columns

id

Primary Key

matchId

FK

roundNumber

Int

sequence

Json

player1Input

Json

player2Input

Json

player1Time

Int

player2Time

Int

winnerPlayerNumber

Int

Nullable

createdAt

DateTime

Indexes

matchId

roundNumber

---

# Table

MatchPlayer

Purpose

Bridge table

Columns

id

Primary Key

matchId

FK

playerId

FK

playerNumber

Int

Relation

Match

Relation

Player

Indexes

matchId

playerId

Composite Unique

matchId

playerNumber

---

# Enum

Difficulty

EASY

MEDIUM

HARD

---

# Enum

SessionStatus

WAITING

LOGIN

READY

COUNTDOWN

SHOW_SEQUENCE

PLAYER_INPUT

ROUND_RESULT

MATCH_RESULT

FINISHED

---

# Enum

Color

RED

GREEN

BLUE

YELLOW

Backend stores Enum.

ESP32 uses integer mapping.

RED = 0

GREEN = 1

BLUE = 2

YELLOW = 3

---

# JSON Structure

Sequence

[
  "RED",
  "GREEN",
  "BLUE"
]

Player Input

[
  "RED",
  "GREEN",
  "BLUE"
]

---

# Database Constraints

Player

lineUserId

Must be unique.

GameSession

Only one active session.

Round Number

Must be greater than zero.

Player Number

Allowed

1

2

Difficulty

Must be valid enum.

---

# Foreign Keys

MatchPlayer.matchId

→ Match.id

Cascade Delete

-------------------------------------

MatchPlayer.playerId

→ Player.id

Restrict Delete

-------------------------------------

Round.matchId

→ Match.id

Cascade Delete

-------------------------------------

Match.winnerId

→ Player.id

Set Null

---

# Cascade Rules

Delete Match

↓

Delete MatchPlayers

↓

Delete Rounds

Delete Player

↓

Not Allowed

Delete Session

↓

No Effect

---

# Query Strategy

Leaderboard

Calculated from Match.

History

Calculated from Match.

Player Statistics

Calculated from Match + Round.

Current Session

GameSession only.

---

# Example Leaderboard Query

Games Played

COUNT(Match)

Wins

COUNT(Winner)

Average Time

AVG(playerTime)

Best Time

MIN(playerTime)

Win Rate

Wins / Games

---

# Example Match

Match

Difficulty

HARD

Winner

Player1

Duration

65342 ms

Score

2-1

Rounds

3

---

# Example Round

Round

2

Sequence

RED

GREEN

BLUE

Player1

RED

GREEN

BLUE

Time

2103

Player2

RED

GREEN

YELLOW

Time

1940

Winner

Player1

---

# Soft Delete

Not Used

Deleted data is permanently removed.

Reason

This project is for exhibitions.

Keeping deleted records is unnecessary.

---

# Transactions

Required

Create Match

Create MatchPlayer

Create Round

Update Session

Must be executed inside a database transaction.

---

# Performance

Expected Data

Less than

100,000 Matches

No database sharding required.

Indexes are sufficient.

---

# Future Compatibility

The schema supports

Tournament

Endless

Time Attack

Mirror Mode

Co-op

without breaking existing tables.

---

# Database Ownership

Only Backend may

Create

Update

Delete

Database records.

ESP32 and Frontend are read-only through Backend APIs.



💡 ผมมีข้อเสนอปรับ Database อีกนิด (แนะนำมาก)

หลังจากดูทั้งหมด ผมคิดว่า Round ควรเก็บข้อมูลละเอียดกว่านี้ เพื่อให้อนาคตทำ Analytics ได้ เช่น

player1CompletedAt Int?

player2CompletedAt Int?

player1Correct Boolean

player2Correct Boolean

player1MistakeIndex Int?

player2MistakeIndex Int?

ตัวอย่าง