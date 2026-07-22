# AGENTS.md

# Memory Arena

## Project Overview

Memory Arena is a two-player IoT memory game built for exhibition and portfolio purposes.

Players authenticate using LINE Login via a Next.js web application.

The game hardware is controlled by an ESP32 running Arduino Framework with PlatformIO.

Backend services are implemented using NestJS and PostgreSQL.

The system records player statistics, match history, leaderboard rankings, and supports admin reset functionality.

This repository is a Monorepo.

```
/
frontend
backend
iot
docs
```

Each package contains its own AGENTS.md with more detailed implementation rules.

Always read the nearest AGENTS.md before making changes.

---

# Core Technologies

Frontend

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- TanStack Query
- Socket.IO Client

Backend

- NestJS
- Prisma ORM
- PostgreSQL
- Socket.IO
- JWT
- LINE Login

IoT

- ESP32 Dev Module
- Arduino Framework
- PlatformIO
- REST API
- WS2812B
- Hardware Interrupt

---

# Architecture

The project follows Clean Architecture.

Responsibilities must be separated.

Frontend

Responsible only for

- UI
- State Management
- API Communication
- Realtime Display

Never implement business logic.

Backend

Responsible for

- Authentication
- Business Logic
- Database
- Game Session
- Leaderboard
- Statistics
- REST API
- Socket.IO

IoT

Responsible only for

- Hardware
- LED
- Button
- Buzzer
- Memory Game Engine
- Communication with Backend

Never store persistent data.

---

# Coding Style

Use TypeScript strict mode.

Never use any.

Avoid duplicate code.

Keep functions short.

Prefer composition over inheritance.

Use descriptive names.

Avoid magic numbers.

Use constants.

Always document exported functions.

---

# Git Rules

Use Conventional Commit.

Examples

feat:

fix:

refactor:

docs:

style:

test:

chore:

---

# Naming Convention

Files

kebab-case

Classes

PascalCase

Variables

camelCase

Constants

UPPER_SNAKE_CASE

Interfaces

Prefix with I

Enums

PascalCase

---

# Folder Naming

Use Feature-Based Structure.

Avoid placing unrelated files together.

---

# Error Handling

Never ignore errors.

Always return meaningful messages.

Log server errors.

Never expose stack traces to users.

---

# Logging

Frontend

Only log during development.

Backend

Use NestJS Logger.

IoT

Serial Monitor only.

---

# Configuration

Never hardcode

API URL

Database URL

Secrets

JWT Secret

LINE Secret

WiFi Password

All configuration must come from environment variables or config files.

---

# Security

Never commit

.env

Private Keys

Access Tokens

Secrets

Validate every API request.

Sanitize user input.

---

# Performance

Avoid unnecessary renders.

Avoid unnecessary HTTP requests.

Use Socket.IO for realtime updates.

Use REST API for CRUD.

---

# Documentation

Every new feature must include

- explanation
- folder placement
- API usage
- configuration if required

---

# Testing

All new code should be testable.

Avoid tightly coupled code.

Prefer dependency injection.

---

# Memory Arena Game Rules

Game Type

Memory Battle

Players

2

Authentication

LINE Login

Match Format

Best of 3

Difficulty

Easy

Medium

Hard

Difference between difficulty

Only

- sequence length
- display speed

Players may only press buttons after the sequence has completely finished displaying.

Button presses during sequence display must be ignored.

Round winner

The first player to correctly reproduce the entire sequence.

Wrong sequence

Player immediately loses the round.

If both players fail

Restart the round.

Leaderboard

Automatically updates after every finished game.

---

# AI Instructions

Before generating code

1. Read this file.
2. Read package AGENTS.md.
3. Follow folder architecture.
4. Do not invent architecture.
5. Keep code modular.
6. Keep code production ready.

Never generate quick prototype code.

Always generate maintainable code.