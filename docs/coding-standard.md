# Memory Arena Coding Standard
Version 1.0

---

# Overview

This document defines the coding standard for the entire backend.

Every developer and AI assistant must follow this specification.

Code quality has higher priority than development speed.

---

# General Principles

- SOLID
- Clean Architecture
- Domain Driven Structure
- Dependency Injection
- Composition over Inheritance
- Single Responsibility
- Keep It Simple

Never write prototype code.

Always write production-ready code.

---

# Language

TypeScript

Strict Mode

Enabled

Never disable strict mode.

---

# Folder Structure

src/

    common/

    config/

    database/

    modules/

Every feature belongs to one module.

Never place business logic inside common/.

---

# Module Structure

modules/

    auth/

        auth.controller.ts

        auth.service.ts

        auth.module.ts

        dto/

        interfaces/

        types/

        constants/

Repeat the same structure for every module.

---

# Controllers

Controllers are HTTP adapters only.

Controllers may

- Receive Request
- Validate DTO
- Call Service
- Return Response

Controllers must never

- Access Prisma
- Calculate Results
- Generate Sequence
- Validate Game Rules

Maximum

150 lines

---

# Services

Services contain business logic.

Every service has only one responsibility.

Maximum

300 lines

Split large services.

---

# Game Module

Never place everything inside

game.service.ts

Use

GameEngineService

SequenceService

ValidatorService

ScoringService

TimerService

StateMachineService

BroadcastService

---

# DTO

Every request

Must use DTO.

Validation

class-validator

Transformation

class-transformer

Never receive any.

---

# Prisma

Controllers

↓

Services

↓

PrismaService

Never

Controller

↓

Prisma

---

# Naming

Classes

PascalCase

Example

GameEngineService

----------------

Interfaces

Prefix

I

Example

IGameResult

----------------

Enums

PascalCase

Example

Difficulty

----------------

Variables

camelCase

----------------

Functions

camelCase

----------------

Constants

UPPER_SNAKE_CASE

----------------

Files

kebab-case

Example

game-engine.service.ts

---

# Methods

One responsibility.

Prefer

20~40 lines.

Maximum

60 lines.

Extract helper methods.

---

# Classes

Maximum

300 lines.

Split responsibilities.

---

# Comments

Explain

WHY

Never explain

WHAT

Bad

// increase score

Good

// Prevent duplicated score update when retry request arrives

---

# Error Handling

Use

HttpException

Custom Exceptions

Global Exception Filter

Never throw plain Error.

---

# Logging

Use NestJS Logger.

Log

Authentication

Session

Match

Round

Admin

Errors

Never log

Passwords

JWT

Secrets

Database URL

---

# Environment Variables

Never hardcode

Secrets

Database URL

JWT Secret

LINE Secret

Device Key

Always use ConfigService.

---

# Database

Always use Prisma.

Never use raw SQL unless required.

Transactions

Required

Match Creation

Round Creation

Reset

---

# Validation

Always validate

DTO

Enum

UUID

Session

Player

Difficulty

Never trust frontend.

Never trust ESP32.

---

# Socket.IO

Only Gateway emits events.

Services call Gateway.

Controllers never emit events.

---

# API Response

Always use

SuccessResponse

ErrorResponse

Never return Prisma model directly.

---

# Async

Always

async / await

Never mix

Promise.then()

---

# Imports

Order

Node

↓

NestJS

↓

Third Party

↓

Internal

↓

Relative

---

# Constants

Never use magic numbers.

Create

constants/

Examples

ROUND_TIMEOUT

COUNTDOWN_TIME

MAX_PLAYERS

MAX_ROUNDS

---

# Configuration

config/

app.config.ts

database.config.ts

game.config.ts

auth.config.ts

Never hardcode configuration.

---

# Utilities

Place reusable functions in

common/utils

Never place business logic there.

---

# Testing

Unit Test

Service

Integration Test

Controller

Mock Prisma

Mock Socket

---

# Git Commit

Format

type(scope): message

Examples

feat(auth): add line login

fix(game): validate sequence

refactor(session): split state machine

docs(api): update swagger

---

# Branch

main

develop

feature/*

bugfix/*

hotfix/*

---

# Swagger

Every endpoint

Summary

Description

Request Example

Response Example

Error Example

Authentication

---

# Performance

Avoid duplicated queries.

Batch database operations.

Reuse DTO.

Avoid unnecessary object creation.

---

# Security

Validate every request.

Escape user input.

Protect admin routes.

Use JWT.

Never expose stack traces.

---

# AI Rules

Before writing code

Read

AGENTS.md

coding-standard.md

Never generate placeholder code.

Never use any.

Never ignore TypeScript errors.

Never violate folder structure.

Always explain where new files belong.

Always generate production-ready code.

If a file exceeds 300 lines,

split it.

If a service has multiple responsibilities,

split it.

Backend is always the Game Controller.