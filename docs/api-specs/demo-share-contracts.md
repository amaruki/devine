# Demo and Share API Contracts

**Version:** 0.1.0  
**Date:** 2026-05-23  
**Author:** Claude Code  
**Status:** Draft  
**Phase:** Sprint 2

## Scope

Covers demo mode, judge demo reset, dashboard companion reads, recent activity reads, and minimal static share snapshot creation and public lookup.

Serves: AC-01.01, AC-01.02, AC-01.03, AC-04.01, AC-04.02, AC-04.03, AC-04.04, AC-04.05, AC-04.06, AC-05.01, AC-05.02, AC-05.03, AC-05.04, AC-12.01, AC-12.02, AC-12.03, AC-13.01, AC-13.02, AC-13.03, AC-13.04, AC-18.01, AC-18.02, AC-18.03, AC-18.04, AC-18.05, AC-20.01, AC-20.02, AC-14.01, AC-14.02, AC-14.03, AC-14.04, AC-14.05, AC-14.10, AC-19.04

Sources: `../business/acceptance-criteria-breakdown/acceptance-criteria-sprint-2.md`, `../technical-specs/05-module-definitions.md`, `../technical-specs/06-data-model.md`, `../technical-specs/07-security.md`, `../technical-specs/08-non-functional-requirements.md`, `../technical-specs/09-authentication-and-authorization.md`, `../technical-specs/13-scoring-game-loop-strategy.md`, `../technical-specs/14-share-snapshot-privacy-strategy.md`

## Landing page data

The landing route may be static. If it needs server data, it must use this safe shape.

```ts
type LandingContent = {
  productName: "Devine";
  hook: string;
  subhook: string;
  demoCtaHref: "/login" | "/register";
  dailyDevNativeMessage: string;
};
```

No personalized data, cookies, tokens, or tracking identifiers are required for the landing hook.

## Demo state read

### `getDemoState()`

Server-only loader for authenticated demo users.

```ts
type DemoPersonaKey = "copaster" | "code_monkey" | "scholar" | "philosopher";

type DemoState = {
  persona: DemoPersonaKey;
  mode: "demo";
  dashboard: {
    health: number;
    healthState: HealthState;
    seniorityLevel: SeniorityLevel;
    seniorityScore: number;
    energyToday: number;
    topTags: string[];
    speechBubble: string;
  };
  lastResetAt: string | null;
};
```

Rules:

1. Requires authenticated user.
2. Reads and writes only the current user's `demo_states`, events, snapshots, inventory, and active effects.
3. Demo state persists on the server and survives refresh.
4. Demo mode works without a daily.dev token.

## Demo mutation

### `applyDemoAction(input)`

Server action for demo buttons.

```ts
type DemoActionInput = {
  action: "read" | "upvote" | "bookmark" | "comment" | "share";
  post?: {
    title?: string;
    tags?: string[];
    url?: string;
  };
};

type DemoActionResult = {
  event: ActivityEventView;
  dashboard: DemoState["dashboard"];
  recentActivity: ActivityEventView[];
};
```

Rules:

1. P95 under 800 ms for local calculation plus database write.
2. Mutates only the current authenticated user's state.
3. Flows through the same activity, scoring, quest, inventory, and snapshot logic as non-demo activity.
4. Normalizes sources to `demo`.
5. Returns updated pet and recent activity data for immediate UI refresh.

Errors:

| Condition            | Error code            |
| -------------------- | --------------------- |
| Missing session      | `unauthorized`        |
| Invalid action       | `invalid_demo_action` |
| Invalid post fields  | `invalid_post`        |
| Database unavailable | `service_unavailable` |

## Demo reset

### `resetDemoState(input)`

Server action for authenticated users resetting their own demo state.

```ts
type ResetDemoStateInput = {
  persona?: DemoPersonaKey;
};

type ResetDemoStateResult = DemoState;
```

Rules:

1. Requires authenticated user.
2. Accepts only known persona presets.
3. Replaces only the caller's demo state and derived demo events/snapshots as needed.
4. Creates a redacted `demo_reset` audit event.

## Judge demo account controls

### `resetJudgeDemoAccount(input)`

Superadmin-only server action for prepared judge demo accounts.

```ts
type ResetJudgeDemoAccountInput = {
  username: string;
  persona?: DemoPersonaKey;
};

type ResetJudgeDemoAccountResult = {
  username: string;
  resetAt: string;
  persona: DemoPersonaKey;
};
```

Rules:

1. Requires authenticated superadmin.
2. Target username must belong to a prepared judge demo account.
3. Resets account state without exposing or changing plaintext passwords.
4. Creates `judge_account_reset` audit event.
5. Returns no session cookies for the target user.

Errors:

| Condition                          | Error code        |
| ---------------------------------- | ----------------- |
| Caller is not superadmin           | `forbidden`       |
| Target is not a judge demo account | `not_found`       |
| Invalid persona                    | `invalid_persona` |

## Companion view model

Dashboard companion components consume this server-derived view model.

```ts
type DuckCompanionView = {
  pet: "rubber_duck";
  healthState: HealthState;
  seniorityLevel: SeniorityLevel;
  speechBubble: string;
  topTags: string[];
  animationCue: "idle" | "celebrate" | "tired" | "revive";
};
```

Rules:

1. Speech bubble text comes from safe deterministic templates.
2. The view model must not include raw user comments or full article lists.
3. Empty states still return a valid rubber duck companion.

## Recent activity read

### `getRecentActivity(input?)`

Server-only loader for dashboard activity history.

```ts
type RecentActivityInput = {
  limit?: number;
};

type RecentActivityResult = {
  items: ActivityEventView[];
};
```

Rules:

1. Requires authenticated user.
2. `limit` defaults to 10 and may not exceed 50.
3. Items include action type, post title, tags, energy earned, source, and timestamp.
4. Missing API fields return `null` or empty arrays without breaking the list.
5. Sources normalize to `dailydev_api`, `in_app`, `manual`, or `demo`.

## `POST /api/share-snapshots`

Creates a static public snapshot for the authenticated owner.

```http
POST /api/share-snapshots
Content-Type: application/json

{}
```

Request body is empty for MVP.

Response `200`:

```json
{
  "ok": true,
  "data": {
    "publicId": "devine_abc123",
    "url": "https://example.com/share/devine_abc123"
  }
}
```

Rules:

1. Requires authenticated user.
2. Rate limit: no more than 20 creations per session per day.
3. Creates a static row copied from the current daily pet snapshot.
4. Public identifier is random and URL-safe.
5. Stores only allowlisted public fields.
6. Creates `snapshot_create` audit event.

Errors:

| Condition                       | Status | Error code             |
| ------------------------------- | ------ | ---------------------- |
| Missing session                 | 401    | `unauthorized`         |
| Rate limit exceeded             | 429    | `rate_limited`         |
| No dashboard snapshot available | 409    | `snapshot_unavailable` |
| Database unavailable            | 503    | `service_unavailable`  |

## Public share route data

### `getPublicShareSnapshot(publicId)`

Used by `/share/[snapshotId]`.

```ts
type PublicShareSnapshot = {
  publicId: string;
  seniorityLevel: SeniorityLevel;
  seniorityScore: number;
  healthState: HealthState;
  topTags: string[];
  speechBubble: string;
  generatedAt: string;
  poweredBy: "Devine";
};
```

Rules:

1. Requires no session.
2. Reads by `public_id`, not internal UUID.
3. P95 under 1.5 seconds.
4. Returns only public projection fields.
5. Never exposes token, email, user ID, daily.dev profile ID, raw events, comments, or full article lists.

Public not-found behavior returns a safe not-found page. Deleted behavior is completed in `recovery-retention-contracts.md`.
