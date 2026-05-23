# 1. Overview

## 1.1 Introduction

Devine is an account-based, dashboard-first Next.js MVP that turns daily.dev reading and engagement signals into a virtual rubber duck habit companion. The system prioritizes hackathon demo reliability, username/password account ownership, privacy-safe sharing, and a pure scoring/game-loop core that can run in demo mode when daily.dev data is unavailable.

> **Terminology:** Product terms come from `../../mvp.md` and `../../prd.md`. A future `../GLOSSARY.md` should mirror the seniority, health, quest, and power-up terms defined here.
>
> **Language policy:** Product UI copy is English. Code, identifiers, database columns, environment variables, and route names are English. Seniority labels preserve the bilingual names from the product docs.

## 1.2 Goals

1. Let a judge understand Devine from the landing page in under 10 seconds. Serves US-01.
2. Let a developer create and use a Devine username/password account with secure cookie-backed JWT sessions. Serves US-02 and US-21.
3. Let an authenticated user connect a daily.dev Personal Access Token or use server-persisted demo mode. Serves US-03, US-04, US-15, and US-17.
4. Show duck health, energy, seniority, quests, inventory, recent activity, next best action, and speech on the dashboard. Serves US-05 through US-13 and US-22.
5. Keep scoring deterministic and testable. Serves US-06 through US-11 and US-16.
6. Create public share snapshots that expose only aggregate safe data. Serves US-14 and US-19.

## 1.3 Scope by module

### 1.3.1 Dashboard UI

In scope: landing page, account pages, dashboard page, settings page, share page, pet hero, stats, scoring breakdown, quests, power-up inventory, recent activity, demo controls, and CTAs. Serves US-01, US-02, US-05, US-09 through US-14, US-18, US-20, and US-21.

### 1.3.2 Scoring engine

In scope: daily energy, per-action caps, health changes, missed-day processing, health states, seniority score, seniority levels, deep tag detection, and tag normalization. Serves US-06, US-07, US-08, US-16, and US-22.

### 1.3.3 Quest and power-up engines

In scope: daily quests, personalized quest selection, weekly quest, rewards, inventory updates, active multiplier effects, and manual power-up use. Serves US-09, US-10, US-11, and US-16.

### 1.3.4 daily.dev integration

In scope: server-side token validation, profile/feed/bookmark fetching, content mapping, rate-limit-aware failure handling, and graceful demo fallback. Serves US-03, US-15, and US-17.

### 1.3.5 Persistence

In scope: users, sessions, daily.dev connections, activity events, daily pet snapshots, inventory, active effects, optional persisted quests, demo state, audit events, share snapshots, migrations, and seeds. Serves US-02, US-14, US-16, US-19, US-20, US-21, and US-22.

### 1.3.6 Operational endpoints

In scope: public health monitoring and non-production database reset with seed selection. Serves deployment and QA contracts required by the technical-spec pipeline.

### 1.3.7 Out of Scope

Full AI chat, leaderboards, browser extension, webhooks, background workers, image export, complex anti-cheat, advanced OAuth, full reading analytics, public social graph, multi-pet selection, and complex rigging remain out of scope per PRD lines 231 through 245.

## 1.4 User base

Primary users are developers who use daily.dev and want a more meaningful learning habit. Secondary users are hackathon judges who need a fast, reliable demo path without credentials.

## 1.5 Business workflow summary

```text
visitor opens /
  see Devine narrative, duck preview, and CTAs
  choose Connect daily.dev or Try Demo Mode

if Try Demo Mode
  require login or account creation
  load authenticated Devine user from JWT cookie and database session
  initialize Code Monkey demo persona if no state exists
  render /dashboard

if Connect daily.dev
  require login or account creation
  load authenticated Devine user from JWT cookie and database session
  open /settings
  user submits Personal Access Token
  server validates token with daily.dev
  server encrypts token and stores connection
  dashboard fetches available daily.dev data server-side

on dashboard open
  load user, mode, events, inventory, active effects, latest snapshot
  process missed days without cron
  calculate today energy and 7-day seniority
  generate quests, next best action, speech bubble
  render duck state and controls

when user simulates or confirms activity
  normalize activity event
  apply active power-up multiplier if applicable
  recalculate energy, health, seniority, quests, and speech
  persist event and current snapshot

when user creates share snapshot
  copy allowed aggregate fields into share_snapshots
  generate publicId
  render /share/[snapshotId] without raw events, token, email, or private IDs
```

## 1.6 Assumptions and known constraints

1. `docs/business/` is the business source of truth for the technical spec set.
2. Username/password accounts are required for private pages and persisted ownership.
3. Bun 1.3 is the locked runtime and package manager.
4. Next.js App Router with SSR and client islands is the locked frontend model.
5. daily.dev Personal Access Tokens are user-provided for the MVP.
6. daily.dev may not expose read history, upvote history, comment history, or share detection, so Devine tracks those actions in-app.
7. Demo mode is first-class and must not depend on credentials or API reliability.
8. Health changes faster than seniority.
9. Power-ups affect only energy and health, never seniority.
10. Share pages expose only static aggregate snapshot data.
