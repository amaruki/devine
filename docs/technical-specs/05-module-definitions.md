# 5. Module Definitions

## 5.1 Dashboard UI module

Responsibility: render the product routes and compose typed view models into UI. Serves US-01, US-02, US-05, US-08 through US-14, US-18, US-20, and US-21.

Public surface:

- `app/(marketing)/page.tsx`
- `app/dashboard/page.tsx`
- `app/dashboard/actions.ts`
- `app/settings/page.tsx`
- `app/settings/actions.ts`
- `components/dashboard/*`
- `components/duck/DuckAvatar.tsx`

Owns no database entities.

## 5.2 Auth module

Responsibility: register users, validate username and password input, hash passwords, create JWT-backed sessions, validate protected-route access, enforce roles, and log out users. Serves US-02, US-20, and US-21.

Public surface:

```ts
registerUser(input: RegisterUserInput): Promise<AuthResult>
loginUser(input: LoginInput): Promise<AuthResult>
logoutUser(sessionId: string): Promise<void>
requireUser(): Promise<AuthContext>
requireSuperadmin(): Promise<AuthContext>
```

Owns `users` and `sessions` through persistence repositories. Uses security helpers for Argon2id hashing and JWT signing.

## 5.3 daily.dev Integration module

Responsibility: call daily.dev with a user-provided Personal Access Token, map response data into internal DTOs, and fail gracefully into demo mode prompts. Serves US-03, US-15, and US-17.

Public surface:

```ts
validateDailyDevToken(token: string): Promise<DailyDevProfile>
fetchDailyDevProfile(token: string): Promise<DailyDevProfile>
fetchDailyDevFeed(token: string): Promise<DailyDevPost[]>
fetchDailyDevBookmarks(token: string): Promise<DailyDevPost[]>
```

Owns no database entities. Uses token security for decryption and activity ingestion for mapping.

## 5.3 Token Security module

Responsibility: encrypt, decrypt, validate metadata for, and delete daily.dev tokens. Serves US-03 and US-19.

Public surface:

```ts
encryptToken(plainText: string): Promise<EncryptedTokenPayload>
decryptToken(payload: EncryptedTokenPayload): Promise<string>
deleteDailyDevConnection(userId: string): Promise<void>
```

Owns `daily_dev_connections` through persistence repositories.

## 5.4 Activity Ingestion module

Responsibility: normalize events from daily.dev API, Devine tracking, and demo mode. Serves US-06, US-12, US-16, and US-19.

Public surface:

```ts
normalizeActivityEvent(input: ActivityInput): ActivityEventDraft
recordActivity(userId: string, input: ActivityInput): Promise<ActivityEvent>
```

Owns `activity_events` through persistence repositories.

## 5.5 Scoring Engine module

Responsibility: calculate energy, caps, health, missed-day decay, seniority score, seniority level, health state, and tag normalization. Serves US-06, US-07, US-08, US-16, and US-22.

Public surface:

```ts
calculateDailyEnergy(events: ActivityEvent[], activeEffects: ActivePowerUpEffect[]): EnergyResult
calculateHealth(previousHealth: number, dailyEnergy: number): HealthResult
processMissedDays(input: MissedDayInput): MissedDayResult
calculateSeniorityScore(events: ActivityEvent[]): SeniorityResult
normalizeTag(tag: string): string
```

Owns no database entities.

## 5.6 Quest Engine module

Responsibility: generate daily, personalized, and weekly quests, calculate progress, and define reward power-ups. Serves US-09, US-10, US-11, and US-16.

Public surface:

```ts
generateQuests(input: QuestInput): Quest[]
calculateQuestProgress(quest: Quest, events: ActivityEvent[]): QuestProgress
claimQuestReward(quest: Quest): PowerUpType
```

Quests are static config for MVP unless persistence is needed for claimed state.

## 5.7 Power-Up Engine module

Responsibility: add inventory, use power-ups, apply immediate effects, and create one-shot active multipliers. Serves US-10 and US-16.

Public surface:

```ts
addPowerUp(inventory: Inventory, type: PowerUpType, quantity: number): Inventory
usePowerUp(input: UsePowerUpInput): UsePowerUpResult
consumeMatchingEffect(input: ConsumeEffectInput): ConsumeEffectResult
```

Owns `power_up_inventory` and `active_power_up_effects` through persistence repositories.

## 5.8 Speech Bubble module

Responsibility: select deterministic product-tone copy from level, health, top tags, recent bookmarks, and weakest score area. Serves US-13.

Public surface:

```ts
selectSpeechBubble(input: SpeechContext): string
```

Owns no database entities.

## 5.9 Demo Mode module

Responsibility: provide persona presets and simulation actions that flow through activity, scoring, quests, and power-ups. Serves US-04, US-18, and US-20.

Public surface:

```ts
getDemoPersona(preset: DemoPersonaKey): DemoPersonaState
applyDemoAction(userId: string, action: ActivityType): Promise<DashboardState>
resetDemoState(userId: string, preset?: DemoPersonaKey): Promise<DashboardState>
```

Owns no separate entities. Uses users, events, snapshots, inventory, and active effects.

## 5.10 Persistence module

Responsibility: provide Drizzle schema, repositories, migrations, seeds, and database clients. Serves US-02, US-16, US-19, US-20, US-21, and US-22.

Public surface:

- `lib/db/schema.ts`
- `lib/db/client.ts`
- `lib/db/repositories/*`
- `lib/db/migrate.ts`
- `lib/db/seed.ts`

Owns all database tables.

## 5.11 Share Snapshot module

Responsibility: create, render, and soft-delete static privacy-safe share snapshots. Serves US-14 and US-19.

Public surface:

```ts
createShareSnapshot(userId: string): Promise<ShareSnapshot>
getPublicShareSnapshot(publicId: string): Promise<PublicShareSnapshot | DeletedShareSnapshot | null>
softDeleteShareSnapshot(userId: string, publicId: string): Promise<void>
```

Owns `share_snapshots` through persistence repositories.

## 5.12 Operations module

Responsibility: health monitoring and non-production reset-state orchestration.

Public REST contracts:

```http
GET /health
```

Response:

```json
{
  "status": "ok",
  "dependencies": {
    "database": { "status": "ok", "latencyMs": 18 },
    "dailydev": {
      "status": "degraded",
      "checked": false,
      "reason": "not checked without user token"
    }
  },
  "version": "0.1.0"
}
```

```http
POST /admin/reset-state
Authorization: Bearer <RESET_STATE_SECRET>
Content-Type: application/json

{ "seed": "dev" }
```

`seed` is `dev` or `qa`. The route is registered only when `APP_ENV` is not `production` and `ENABLE_RESET_API=true`. In production, the route must not exist. The reset runs synchronously for MVP: wipe application tables, run migrations, run selected idempotent seed, and return the result.

Response:

```json
{
  "status": "ok",
  "seed": "dev",
  "resetAt": "2026-05-23T12:00:00.000Z"
}
```

## 5.13 Shared-package usage

The MVP is a single app, not a workspace. Shared code lives in `lib/` modules. A future package split must preserve the public-surface rule and keep domain engines independent of React.
