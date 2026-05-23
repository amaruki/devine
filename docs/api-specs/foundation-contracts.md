# Foundation API and Server-Action Contracts

**Version:** 0.1.0  
**Date:** 2026-05-23  
**Author:** Claude Code  
**Status:** Draft  
**Phase:** Sprint 1

## Scope

Covers auth actions, session shape, private route access behavior, activity submission, daily snapshot reads, scoring reads, audit expectations, timezone handling, health, and non-production reset-state contracts.

Serves: AC-02.01, AC-02.02, AC-02.03, AC-02.05, AC-02.06, AC-02.07, AC-02.08, AC-02.09, AC-02.10, AC-02.11, AC-02.12, AC-02.13, AC-02.14, AC-02.15, AC-02.16, AC-02.17, AC-06.01, AC-06.02, AC-06.03, AC-06.04, AC-06.05, AC-06.06, AC-06.07, AC-06.08, AC-06.09, AC-06.10, AC-06.11, AC-06.12, AC-07.01, AC-07.02, AC-07.03, AC-07.04, AC-07.05, AC-07.06, AC-07.07, AC-07.08, AC-07.09, AC-08.01, AC-08.02, AC-08.03, AC-08.04, AC-08.05, AC-08.06, AC-08.07, AC-08.08, AC-08.09, AC-08.10, AC-08.11, AC-08.12, AC-08.13, AC-08.14, AC-16.01, AC-16.02, AC-16.03, AC-16.04, AC-16.05, AC-16.06, AC-16.07, AC-16.08, AC-16.09, AC-19.01, AC-19.02, AC-19.03, AC-19.04, AC-19.05, AC-22.01

Sources: `../business/acceptance-criteria-breakdown/acceptance-criteria-sprint-1.md`, `../technical-specs/05-module-definitions.md`, `../technical-specs/06-data-model.md`, `../technical-specs/07-security.md`, `../technical-specs/08-non-functional-requirements.md`, `../technical-specs/09-authentication-and-authorization.md`, `../technical-specs/10-integration-points.md`, `../technical-specs/13-scoring-game-loop-strategy.md`

## Shared domain types

```ts
type HealthState = "thriving" | "stable" | "tired" | "sick" | "critical" | "hibernating";
type SeniorityLevel = "ignorant_copaster" | "code_monkey" | "grounded_scholar" | "tech_philosopher";
type ActivityType = "read" | "upvote" | "bookmark" | "comment" | "share";
type ActivitySource = "dailydev_api" | "in_app" | "manual" | "demo";
```

## Auth actions

### `registerUser(input)`

Server action used by the signup form.

```ts
type RegisterUserInput = {
  username: string;
  password: string;
  email?: string;
  timezone?: string;
};

type AuthUser = {
  id: string;
  username: string;
  displayUsername: string;
  email: string | null;
  role: "user" | "superadmin";
  timezone: string;
  mode: "demo" | "connected";
};

type AuthResult = {
  user: AuthUser;
  redirectTo: "/dashboard";
};
```

Validation:

| Field      | Rule                                                                              | Error code          |
| ---------- | --------------------------------------------------------------------------------- | ------------------- |
| `username` | 3 to 24 characters, letters, numbers, underscores, starts with a letter or number | `invalid_username`  |
| `username` | Normalized lowercase value is unique                                              | `username_taken`    |
| `username` | Not one of the reserved route or system names                                     | `reserved_username` |
| `password` | At least 8 characters with uppercase, lowercase, number, and symbol               | `weak_password`     |
| `email`    | Optional. If present, valid email syntax and unique nullable value                | `invalid_email`     |
| `timezone` | Optional IANA timezone, default `UTC`                                             | `invalid_timezone`  |

Success behavior:

1. Hash password with Argon2id.
2. Store normalized username and display username.
3. Create a `sessions` row with seven-day expiry.
4. Set an httpOnly session cookie with JWT claims.
5. Create initial account-bound state needed by dashboard reads.
6. Record an audit event without plaintext credentials.

Failure behavior:

| Condition            | Result                                                        |
| -------------------- | ------------------------------------------------------------- |
| Invalid form input   | Return field errors with no user or session row.              |
| Duplicate username   | Return `username_taken`.                                      |
| Duplicate email      | Return `email_taken`.                                         |
| Database unavailable | Return `service_unavailable` and log a redacted server error. |

### `loginUser(input)`

```ts
type LoginInput = {
  username: string;
  password: string;
};
```

Success behavior:

1. Normalize username before lookup.
2. Verify Argon2id password hash.
3. Create a new seven-day session row.
4. Set session cookie.
5. Record `login_success` audit event.

Failure behavior:

| Condition                            | Error code            | Notes                                    |
| ------------------------------------ | --------------------- | ---------------------------------------- |
| Unknown username or invalid password | `invalid_credentials` | Do not reveal which field failed.        |
| Rate limit exceeded                  | `rate_limited`        | Per-session or per-IP lightweight limit. |
| Database unavailable                 | `service_unavailable` | No cookie is set.                        |

### `logoutUser()`

Revokes the current session row when present, clears the session cookie, and redirects to `/`. Missing or expired sessions still clear the cookie.

## Session contract

Session JWT claims:

```ts
type SessionClaims = {
  userId: string;
  username: string;
  role: "user" | "superadmin";
  sessionId: string;
  iat: number;
  exp: number;
  tokenVersion: number;
};
```

Protected access verifies signature, expiry, matching `users.token_version`, and active `sessions` row. Public exceptions are `/`, auth routes, public share routes, and `GET /health`.

## Dashboard state read

### `getDashboardState()`

Server-only loader for `/dashboard`.

```ts
type DashboardState = {
  user: {
    username: string;
    timezone: string;
    mode: "demo" | "connected";
  };
  pet: {
    selectedPet: "rubber_duck";
    health: number;
    healthState: HealthState;
    energyToday: number;
    dailyTarget: 50;
    seniorityLevel: SeniorityLevel;
    seniorityScore: number;
    scoreBreakdown: {
      readingConsistency: number;
      topicVariety: number;
      curation: number;
      discussion: number;
      socialContribution: number;
      deepTechSignals: number;
    };
  };
  recentActivity: ActivityEventView[];
  generatedAt: string;
};

type ActivityEventView = {
  id: string;
  type: ActivityType;
  source: ActivitySource;
  postTitle: string | null;
  postUrl: string | null;
  tags: string[];
  energyEarned: number;
  occurredAt: string;
};
```

Behavior:

1. Requires authenticated user.
2. Processes missed days on dashboard open.
3. Uses the user's IANA timezone for daily cap and snapshot boundaries.
4. Reads only the current user's events, snapshots, inventory, quests, and demo state.
5. Returns a recoverable empty state when no activity exists.

Errors:

| Condition                  | Error code            |
| -------------------------- | --------------------- |
| Missing or invalid session | `unauthorized`        |
| Database unavailable       | `service_unavailable` |

## Activity submission

### `recordActivity(input)`

Server action for Devine-tracked activity and manual/demo fallback actions.

```ts
type RecordActivityInput = {
  type: ActivityType;
  source: "in_app" | "manual" | "demo";
  idempotencyKey?: string;
  post?: {
    dailyDevPostId?: string;
    title?: string;
    url?: string;
    tags?: string[];
  };
  occurredAt?: string;
};

type RecordActivityResult = {
  event: ActivityEventView;
  pet: DashboardState["pet"];
};
```

Behavior:

1. Requires authenticated user.
2. Normalizes tags before scoring.
3. Applies per-action daily caps and one-shot power-up effects before storing `energy_earned`.
4. Deduplicates on `(user_id, idempotency_key)` when present.
5. Deduplicates daily.dev event IDs when source is API-owned in later specs.
6. Updates or creates the user's daily snapshot for their local day.

Errors:

| Condition                       | Error code                                            |
| ------------------------------- | ----------------------------------------------------- |
| Invalid activity type or source | `invalid_activity`                                    |
| Invalid URL or oversized title  | `invalid_post`                                        |
| Duplicate idempotency key       | Success with the existing event and current pet state |
| Missing session                 | `unauthorized`                                        |

## Scoring contract

Energy values and daily caps match `../technical-specs/13-scoring-game-loop-strategy.md §13.3`.

| Action     | Energy | Daily cap |
| ---------- | -----: | --------: |
| `read`     |     10 |         5 |
| `upvote`   |      3 |        10 |
| `bookmark` |      5 |         5 |
| `comment`  |     15 |         3 |
| `share`    |     12 |         3 |

Health deltas match the locked formula table. Health is clamped between 0 and 100. Seniority is a seven-day score with the documented component weights, rounded for display.

## `GET /health`

Public route.

```http
GET /health
```

Response `200`:

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

Rules:

1. P95 under 500 ms without daily.dev external check.
2. No secrets, environment values, connection strings, user data, or raw exception details.
3. Database degraded status is allowed when the database is unreachable.

## `POST /admin/reset-state`

Non-production route only. The route is absent in production.

```http
POST /admin/reset-state
Authorization: Bearer <RESET_STATE_SECRET>
Content-Type: application/json

{ "seed": "dev" }
```

Request:

```ts
type ResetStateInput = {
  seed: "dev" | "qa";
};
```

Response `200`:

```json
{
  "status": "ok",
  "seed": "dev",
  "resetAt": "2026-05-23T12:00:00.000Z"
}
```

Rules:

1. Registered only when `APP_ENV !== "production"` and `ENABLE_RESET_API=true`.
2. Reject missing or invalid bearer secret with `401` and `unauthorized`.
3. Reject unknown seed with `400` and `invalid_seed`.
4. Run migrations and selected idempotent seed through versioned scripts.
5. Never accept arbitrary file paths.
