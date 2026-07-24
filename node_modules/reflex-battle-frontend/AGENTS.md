# AGENTS.md

# Memory Arena Frontend

## Overview

This package contains the Next.js frontend for Memory Arena.

The frontend is responsible only for presentation, user interaction, API communication, and realtime updates.

Business logic must remain inside the backend.

Never move backend logic into frontend.

---

# Stack

Framework

- Next.js 15
- React 19
- App Router

Language

- TypeScript

Styling

- Tailwind CSS v4

UI

- shadcn/ui

Icons

- Lucide React

Data Fetching

- TanStack Query

Realtime

- Socket.IO Client

Forms

- React Hook Form

Validation

- Zod

Animation

- Framer Motion

---

# Responsibilities

Frontend is responsible for

- User Interface
- LINE Login
- Display Game State
- Leaderboard
- Statistics
- Countdown
- Match Result
- Realtime Updates

Frontend is NOT responsible for

- Game Logic
- Winner Calculation
- Database
- Authentication Logic
- Session Validation

---

# Folder Structure

Use Feature-Based Structure.

```
src/

app/

components/

features/

auth/

game/

leaderboard/

history/

admin/

hooks/

lib/

services/

socket/

types/

utils/

constants/
```

Never place all components inside one folder.

---

# Components

Components must be small.

Maximum

200 lines

Split large components.

Separate

- UI
- Logic
- Hooks

---

# Styling

Always use Tailwind CSS.

Never use CSS Modules.

Never use inline styles.

Use utility classes.

Prefer reusable components.

---

# shadcn/ui

Use shadcn components whenever possible.

Examples

Button

Card

Badge

Dialog

Toast

Tooltip

Input

Tabs

Table

Avatar

Dropdown

Skeleton

---

# Theme

Primary Color

Emerald

Rounded

large

Soft shadows

Modern gaming style

Responsive

Dark mode ready

---

# Icons

Only use Lucide React.

Never mix icon libraries.

---

# State

Server State

TanStack Query

Local State

React State

Global State

Context only when necessary.

Avoid unnecessary Context.

---

# API

Never call fetch directly.

Create API clients.

Example

```
services/

api.ts

auth.service.ts

game.service.ts

leaderboard.service.ts
```

---

# Socket.IO

Create one singleton socket instance.

Do not reconnect repeatedly.

Socket should receive

Game Started

Countdown

Sequence

Round Result

Game Finished

Leaderboard Updated

Admin Reset

---

# Authentication

Use LINE Login only.

Never implement custom login.

Store access token securely.

Logout after game finishes.

---

# Game Screen

Display

Current Round

Difficulty

Countdown

Sequence Animation

Player Progress

Winner

Reaction Time

Elapsed Time

Score

Game Status

---

# Memory Game Rules

Display sequence exactly as received.

Do not calculate sequence locally.

Backend is source of truth.

Disable user interaction while sequence is displaying.

Enable interaction only after backend indicates input phase.

---

# Countdown

Animate

3

2

1

GO

Smooth transitions.

---

# Sequence Animation

Show colors

One by one.

Never display the entire sequence instantly.

Animation speed comes from backend.

---

# Leaderboard

Display

Player Avatar

Display Name

Wins

Losses

Best Time

Average Time

Games Played

Perfect Games

Rank

Realtime updates.

---

# Match History

Display

Winner

Loser

Difficulty

Rounds

Duration

Created Date

---

# Admin

Separate route

/admin

Never expose admin menu publicly.

---

# Routing

Public

/

/login

/leaderboard

Private

/game

/history

Admin

/admin

---

# Error UI

Show friendly messages.

Never expose backend errors.

Use Toast.

---

# Loading

Use Skeleton.

Avoid layout shifts.

---

# Accessibility

Buttons

Keyboard accessible.

Dialogs

Focus trapped.

Images

Always include alt.

---

# Performance

Use

memo

useMemo

useCallback

only when beneficial.

Lazy load large pages.

Optimize images.

---

# TypeScript

Strict Mode.

No any.

No unknown casting.

Use interfaces.

Use enums.

---

# Naming

Pages

page.tsx

Layouts

layout.tsx

Components

PascalCase

Hooks

useSomething

Services

something.service.ts

---

# Forms

React Hook Form

Zod Validation

Never manually validate forms.

---

# Environment Variables

NEXT_PUBLIC_API_URL

NEXT_PUBLIC_SOCKET_URL

NEXT_PUBLIC_LINE_LOGIN_URL

Never hardcode URLs.

---

# Constants

Create

constants/

colors.ts

game.ts

routes.ts

socket.ts

---

# Hooks

Custom hooks

useCountdown()

useSocket()

useGame()

useLeaderboard()

useAuth()

Keep hooks reusable.

---

# Animations

Framer Motion only.

Avoid excessive animation.

Animation should improve UX.

---

# Testing

Components should be testable.

Avoid tightly coupled code.

---

# AI Instructions

Before generating code

1. Read root AGENTS.md
2. Follow Feature-Based Structure
3. Use Tailwind CSS only
4. Use shadcn/ui
5. Keep components reusable
6. Never implement backend logic
7. Follow Memory Arena rules

Always generate production-ready frontend code.