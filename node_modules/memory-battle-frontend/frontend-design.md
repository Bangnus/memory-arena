# Frontend Design Specification
# Game UI Design System

## 1. Product Vision

ออกแบบ Frontend UI ให้มีความรู้สึกเหมือน "Game Dashboard"
ผสมระหว่าง:

- Modern Game Interface
- RPG Dashboard
- Cyber / Futuristic Style
- Gamification System
- Real-time Interaction

เป้าหมาย:
- ผู้ใช้รู้สึกเหมือนกำลังเล่นเกม ไม่ใช่ใช้งานระบบทั่วไป
- UI ต้องสนุก มี Animation และ Feedback
- ทุก Action มี Reward / Progress / Status

---

# 2. Design Direction

## Theme

ชื่อ Style:

"Neon Fantasy Game UI"

Mood:

- Futuristic
- Premium
- Interactive
- Energetic
- Competitive


Reference:

- RPG Game HUD
- Mobile Game Dashboard
- Sci-Fi Control Panel
- E-Sport Interface


---

# 3. Color System


## Primary Colors

```css
--color-primary: #00E5FF;
--color-primary-dark: #0097A7;
--color-primary-light: #80F7FF;



Secondary
--color-secondary: #8B5CF6;
--color-secondary-light: #C4B5FD;

Accent
--color-gold: #FFD700;
--color-success: #22C55E;
--color-warning: #F59E0B;
--color-danger: #EF4444;


Background
--bg-main: #050816;
--bg-card: #0F172A;
--bg-panel: #111827;
--bg-overlay: rgba(0,0,0,0.6);


4. Typography

Font:

Primary:

Inter
Orbitron
Rajdhani

Style:

Heading
font-size: 32px
font-weight: 800
letter-spacing: 1px
Title
font-size: 24px
font-weight:700
Body
font-size:16px
font-weight:400
Game Number

ใช้สำหรับ:

Score
Level
Coins
Rank
font-size:48px
font-weight:900
5. Layout Structure
Main Application
App
|
├── Game Header
|
├── Player Profile
|
├── Main Content
|
├── Quest / Mission Panel
|
├── Ranking
|
└── Bottom Navigation
6. Game Header

Component:

GameHeader

Layout:

------------------------------------------------
| Avatar | Player Name | Level | Coin | Energy |
------------------------------------------------

Features:

Player avatar
Level badge
XP progress bar
Currency
Notification

Example:

[Avatar]

Player:
Peerapat

LV.25

████████░░ 80%

💎 2500
⚡ 90%
7. Player Card

Component:

PlayerCard

Design:

Glassmorphism Card

Properties:

background:
linear-gradient()

border:
1px solid rgba(255,255,255,0.15)

shadow:
0 0 30px rgba(0,229,255,.3)

Contains:

Avatar
Username
Level
Rank
XP
Achievement
8. Game Card Component

Component:

GameCard

Style:

border-radius:24px

background:
rgba(255,255,255,0.05)

backdrop-filter:
blur(15px)

border:
1px solid rgba(255,255,255,.1)

Hover:

scale(1.03)

glow effect

transition .3s
9. Button Design
Primary Button

Example:

START GAME

Style:

height:56px

border-radius:16px

background:
linear-gradient(
90deg,
#00E5FF,
#8B5CF6
)

Effect:

Glow
Particle
Press animation

Animation:

hover:
scale(1.05)

active:
scale(.95)
10. Progress Bar

Used for:

XP
Energy
Loading
Quest

Design:

--------------------------------
██████████████░░░░
--------------------------------

Style:

Gradient fill

Animation:

width transition 1s ease
11. Quest System UI

Component:

QuestCard

Example:

--------------------------------

🔥 Daily Quest

Kill Monster

Progress

███████░░░ 70%


Reward

⭐ +500 XP
💎 +100 Coin


[CLAIM]

--------------------------------
12. Achievement UI

Component:

AchievementBadge

Style:

Circle Badge

States:

Locked:

opacity .3
grayscale

Unlocked:

gold glow
particle effect
13. Ranking UI

Component:

Leaderboard

Layout:

Rank | Player | Score

🥇 Alex     9999
🥈 John     8500
🥉 Mike     7000

Top Rank:

Larger card
Glow
Crown icon
14. Animation System

Library:

Framer Motion

Required Animation:

Page Enter
fade + slide up
Card Hover
scale 1.05
translateY(-5px)
Reward
particle explosion
Level Up
screen glow
confetti
15. Icon System

Use:

Lucide React
Phosphor Icons

Icon Style:

Outline
Neon glow

Example:

⚔ Battle

🎯 Quest

🏆 Rank

💎 Reward

⚡ Energy
16. Responsive Design
Desktop
Sidebar
+
Main Dashboard
Tablet
2 Column Layout
Mobile
Bottom Navigation

Card Stack
17. Component Structure
src

/components

 ├── game

 │    ├── PlayerCard.tsx
 │    ├── QuestCard.tsx
 │    ├── RewardCard.tsx
 │    ├── LevelBadge.tsx
 │    ├── EnergyBar.tsx
 │    └── Leaderboard.tsx


 ├── ui

 │    ├── Button.tsx
 │    ├── Card.tsx
 │    ├── Modal.tsx
 │    └── Progress.tsx


18. State Management

Global State:

Zustand

Store:

player

{
 level,
 xp,
 coins,
 energy,
 rank
}


quest

{
 missions[],
 rewards[]
}


game

{
 status,
 score,
 timer
}

19. Sound Feedback

Optional:

Events:

Button:

click.wav

Reward:

reward.wav

Level Up:

levelup.wav
20. UX Rules

Every action must have:

Visual feedback
Animation
Sound (optional)
Reward indication

Never create:

Plain table UI
Boring form UI
Static dashboard

Everything should feel:

"เหมือนกำลังเล่นเกม"

21. Recommended Tech Stack

Frontend:

Next.js
TypeScript
TailwindCSS
Framer Motion
Zustand
React Query
Lucide Icons

UI:

Custom Game Design System

Avoid:

Default Bootstrap style
Generic Admin Dashboard style
Final Design Goal

สร้างประสบการณ์ UI ที่เหมือน:

"เปิดเกมแล้วเข้าสู่หน้า Main Hub"

ไม่ใช่:

"เปิดเว็บ Application"


