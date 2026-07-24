# Memory Arena Backend

## Objective

You are a Senior Software Engineer.

Your task is to build a production-ready backend for the Memory Arena project.

This project will be used in a real exhibition.

Never generate prototype code.

Always generate maintainable production-ready code.

---

# Project Overview

Memory Arena is a local multiplayer IoT memory game.

Architecture

ESP32
↓

NestJS Backend
↓

PostgreSQL

↓

Next.js Frontend

Backend is the Game Controller.

Frontend is Display only.

ESP32 is Game Device only.

Backend owns all business logic.

---

# Technology Stack

Framework

NestJS

Language

TypeScript

Database

PostgreSQL

ORM

Prisma

Realtime

Socket.IO

Authentication

LINE Login

Validation

class-validator

Configuration

@nestjs/config

Documentation

Swagger

Testing

Jest

Deployment

Docker

Package Manager

pnpm

---

# Architecture

Follow

Clean Architecture

Domain Driven Design

SOLID

Dependency Injection

Repository Pattern

Never violate these principles.

---

# Read Documentation First

Before generating code, always read

docs/

game-spec.md

database-spec.md

backend-architecture.md

game-engine.md

api-spec.md

socket-spec.md

esp32-protocol.md

state-machine.md

coding-standard.md

These documents are the source of truth.

Never contradict them.

---

# Folder Structure

src/

common/

config/

database/

modules/

Every feature belongs to a module.

Never generate flat architecture.

---

# Modules

Auth

Player

Session

Game

Match

Leaderboard

History

Admin

Socket

Health

---

# Game Engine

Split into

GameEngineService

SequenceService

ValidatorService

ScoringService

TimerService

BroadcastService

StateMachineService

Never place everything inside GameService.

---

# State Machine

The backend controls

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

Only StateMachineService changes states.

---

# Responsibilities

Backend owns

Authentication

Sessions

Game Rules

Sequence Generation

Winner Calculation

Score

Database

Statistics

Leaderboard

Socket Events

Admin

Backend never controls LEDs.

Backend never reads buttons.

---

# ESP32

ESP32

Displays LEDs

Reads Buttons

Measures Time

Sends Raw Inputs

Never validates game logic.

---

# Frontend

Frontend

Displays UI

Receives Socket Events

Calls REST API

Never calculates winner.

Never calculates scores.

---

# Database

Use Prisma.

Never use raw SQL.

Always use Transactions.

Never expose Prisma models.

---

# DTO

Every endpoint

Request DTO

Response DTO

Validation

Transformation

No exceptions.

---

# Controllers

Controllers only

Receive Request

↓

Validate DTO

↓

Call Service

↓

Return Response

Controllers never

Access Prisma

Generate Sequence

Calculate Winner

Emit Socket Events

---

# Services

Business Logic only.

One responsibility.

Split large services.

---

# Socket.IO

Realtime communication.

Only Gateway emits events.

Never emit inside controllers.

---

# API

REST API

/api/v1

Swagger required.

Every endpoint

Summary

Description

Example

Error Example

Authentication

---

# Logging

NestJS Logger

Log

Auth

Session

Match

Round

Admin

Errors

Never log

JWT

Secrets

Passwords

---

# Security

JWT

Validation

DTO

Environment Variables

Protected Admin APIs

Never trust frontend.

Never trust ESP32.

---

# Error Handling

Use

Global Exception Filter

Custom Exceptions

HttpException

Never throw plain Error.

---

# Configuration

Use ConfigService.

Never hardcode

Secrets

Timeouts

URLs

Keys

---

# Testing

Generate

Unit Tests

Integration Tests

Mock Prisma

Mock Gateway

---

# AI Rules

Always explain

Folder

Purpose

Dependencies

before generating code.

Never generate placeholder code.

Never use any.

Never disable strict mode.

Never violate coding-standard.md.

Generate production-ready code only.

---

# Development Order

1

Project Setup

↓

2

Prisma

↓

3

Authentication

↓

4

Player

↓

5

Session

↓

6

Game Engine

↓

7

Socket.IO

↓

8

Match

↓

9

Leaderboard

↓

10

History

↓

11

Admin

↓

12

Testing

---

# Success Criteria

The project must

Compile without errors.

Follow SOLID.

Support future game modes.

Be easy to maintain.

Be production-ready.

Backend must be the Single Source of Truth.