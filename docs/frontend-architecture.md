# Frontend Architecture
Version 1.0

---

# Overview

The Frontend is responsible for visualization only.

The frontend never contains business logic.

The backend is the only source of truth.

The frontend only

- Login
- Display
- Animation
- Leaderboard
- History
- Admin

---

# Tech Stack

Framework

Next.js 15

Language

TypeScript

Styling

Tailwind CSS

UI Library

shadcn/ui

Icons

lucide-react

Animation

framer-motion

Realtime

Socket.IO Client

Authentication

LINE Login

State Management

Zustand

Data Fetching

TanStack Query

Validation

Zod

Theme

next-themes

---

# Folder Structure

src/

    app/

    components/

    features/

    hooks/

    layouts/

    lib/

    providers/

    services/

    stores/

    styles/

    types/

    utils/

---

# Features

auth/

game/

leaderboard/

history/

admin/

common/

---

# Components

components/

ui/

layout/

game/

leaderboard/

dialogs/

animations/

---

# App Router

/

↓

Waiting

/login

↓

LINE Login

/game

↓

Game Screen

/result

↓

Match Result

/history

↓

History

/leaderboard

↓

Leaderboard

/admin

↓

Dashboard

---

# State

Use Zustand

Stores

auth.store.ts

session.store.ts

game.store.ts

socket.store.ts

leaderboard.store.ts

admin.store.ts

---

# Rules

Never calculate winner.

Never calculate score.

Never generate sequence.

Never modify game state.

Everything comes from Backend.

---

# Data Flow

REST API

↓

TanStack Query

↓

Store

↓

Components

Realtime

↓

Socket.IO

↓

Store

↓

Components

---

# API Layer

services/

auth.api.ts

game.api.ts

session.api.ts

leaderboard.api.ts

history.api.ts

admin.api.ts

---

# Socket Layer

services/

socket.service.ts

Only one socket connection.

Reconnect automatically.

---

# UI States

Waiting

↓

Player Login

↓

Difficulty

↓

Countdown

↓

Show Sequence

↓

Player Input

↓

Round Result

↓

Match Result

↓

Reset

---

# Components

GameScreen

Countdown

SequenceDisplay

PlayerCard

ScoreBoard

WinnerDialog

Leaderboard

HistoryTable

AdminDashboard

---

# Hooks

useSocket()

useSession()

useLeaderboard()

useCountdown()

useGame()

---

# Animations

Countdown

Fade

Sequence

Glow

Winner

Confetti

Reset

Fade Out

---

# Error Handling

Toast

Reconnect

Retry

Fallback Screen

---

# Theme

Primary

#00C6AE

Rounded

Large

Modern

Dark Mode

Supported

---

# Performance

Lazy Loading

Memo

Suspense

Dynamic Import

Image Optimization

---

# AI Rules

Never place API calls inside components.

Use custom hooks.

Keep components under 200 lines.

Split large pages.

Use reusable UI.

Never duplicate code.

Frontend is Display Layer only.