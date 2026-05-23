# daily.dev Integration API Contracts

**Version:** 0.1.0  
**Date:** 2026-05-23  
**Author:** Claude Code  
**Status:** Draft  
**Phase:** Sprint 4

## Scope

Covers daily.dev token validation, token persistence, token revocation, connected-mode reads, external API fallback envelopes, pagination, profile/feed/bookmark/post/comment access, and demo fallback behavior.

Serves: AC-03.01, AC-03.02, AC-03.03, AC-03.04, AC-03.05, AC-03.06, AC-03.07, AC-03.08, AC-03.09, AC-15.01, AC-15.02, AC-15.03, AC-15.04, AC-15.05, AC-17.01, AC-17.02, AC-17.03, AC-17.04, AC-17.05, AC-17.06, AC-17.07, AC-17.08, AC-17.09

Sources: `../business/acceptance-criteria-breakdown/acceptance-criteria-sprint-4.md`, `../technical-specs/05-module-definitions.md`, `../technical-specs/06-data-model.md`, `../technical-specs/07-security.md`, `../technical-specs/08-non-functional-requirements.md`, `../technical-specs/10-integration-points.md`, `../technical-specs/12-dailydev-integration-strategy.md`

## External daily.dev constraints

| Concern            | Contract                                                                                           |
| ------------------ | -------------------------------------------------------------------------------------------------- |
| Base URL           | `https://api.daily.dev/public/v1`                                                                  |
| Authentication     | Bearer token from the authenticated user's saved Personal Access Token.                            |
| Client location    | Server only. Client components never call daily.dev directly.                                      |
| Token exposure     | Plain token exists only in request memory during validation or API calls.                          |
| Cache              | No persistent raw API response cache for MVP. Store normalized activity events and snapshots only. |
| Unsupported fields | Missing or unsupported daily.dev fields degrade gracefully.                                        |
| Rate limits        | Respect daily.dev rate-limit responses and avoid aggressive retries.                               |

## Shared types

```ts
type DailyDevConnectionStatus = {
  connected: boolean;
  mode: "demo" | "connected";
  profile: DailyDevProfile | null;
  lastValidatedAt: string | null;
};

type DailyDevProfile = {
  id?: string;
  handle?: string;
  name?: string;
  image?: string;
};

type DailyDevPost = {
  id: string;
  title: string;
  url: string;
  tags: string[];
  source?: string;
  publishedAt?: string;
};

type DailyDevPage<T> = {
  items: T[];
  pageInfo: {
    nextCursor: string | null;
    hasNextPage: boolean;
  };
  degraded: boolean;
  fallbackReason: string | null;
};
```

## `POST /api/dailydev/test-connection`

Validates a submitted Personal Access Token and saves the encrypted connection on success.

```http
POST /api/dailydev/test-connection
Content-Type: application/json

{ "token": "<personal-access-token>" }
```

Request:

```ts
type TestConnectionInput = {
  token: string;
};
```

Response `200`:

```json
{
  "ok": true,
  "data": {
    "connected": true,
    "mode": "connected",
    "profile": {
      "id": "u_123",
      "handle": "amaruki",
      "name": "Amaruki",
      "image": "https://..."
    },
    "lastValidatedAt": "2026-05-23T12:00:00.000Z"
  }
}
```

Rules:

1. Requires authenticated user.
2. Token test rate limit is 10 attempts per session per hour.
3. Validation budget is 5 seconds P95 excluding daily.dev outage.
4. Success encrypts the token server-side using AES-GCM and stores only encrypted payload metadata.
5. Success updates user mode to `connected` and safe profile metadata when available.
6. Response never includes the submitted token or encrypted payload internals.
7. Creates `token_connect` audit event on success.
8. Creates `token_validation_failure` audit event on failure without storing the token.

Errors:

| Condition                   | Status | Error code               |
| --------------------------- | ------ | ------------------------ |
| Missing session             | 401    | `unauthorized`           |
| Empty token                 | 400    | `invalid_token`          |
| daily.dev rejects token     | 401    | `dailydev_token_invalid` |
| Rate limit exceeded         | 429    | `rate_limited`           |
| daily.dev timeout or outage | 503    | `dailydev_unavailable`   |
| Database unavailable        | 503    | `service_unavailable`    |

## Get connection status

### `getDailyDevConnectionStatus()`

Server-only settings loader.

```ts
type DailyDevConnectionStatusResult = DailyDevConnectionStatus;
```

Rules:

1. Requires authenticated user.
2. Returns only safe profile metadata and validation timestamps.
3. Does not decrypt the token.
4. Missing connection returns `{ connected: false, mode: "demo", profile: null, lastValidatedAt: null }`.

## Disconnect daily.dev

### `disconnectDailyDev()`

Server action.

```ts
type DisconnectDailyDevResult = {
  connected: false;
  mode: "demo";
};
```

Rules:

1. Requires authenticated user.
2. Deletes the user's saved encrypted token payload.
3. Sets user mode to `demo`.
4. Preserves existing Devine-tracked events and snapshots.
5. Creates `disconnect` audit event.
6. Idempotent when no connection exists.

## Connected dashboard feed

### `getConnectedDashboardFeed(input?)`

Server-only loader used by `/dashboard` when mode is connected.

```ts
type ConnectedFeedInput = {
  cursor?: string;
  limit?: number;
};

type ConnectedFeedResult = DailyDevPage<DailyDevPost> & {
  connection: DailyDevConnectionStatus;
};
```

Rules:

1. Requires authenticated user with saved connection.
2. Decrypts token only inside the server loader.
3. Fetches personalized feed where daily.dev supports it.
4. Cursor-paginates results when daily.dev provides cursor data.
5. Maps external posts into internal `DailyDevPost` DTOs.
6. Feed fetches do not count as learning activity.
7. Timeout falls back within the connected dashboard budget of 3.5 seconds P95.
8. On daily.dev failure, return `degraded: true` and preserve app usability through demo prompts and existing Devine-tracked state.

Errors and degraded states:

| Condition                | Result                                                                            |
| ------------------------ | --------------------------------------------------------------------------------- |
| No saved token           | Return degraded page with `fallbackReason: "not_connected"`.                      |
| Invalid or expired token | Return degraded page with `fallbackReason: "token_invalid"` and prompt reconnect. |
| Rate limited             | Return degraded page with `fallbackReason: "rate_limited"`.                       |
| Missing optional fields  | Return mapped posts with nullable optional fields.                                |
| Database unavailable     | Return `service_unavailable`.                                                     |

## Bookmark access

### `getDailyDevBookmarks(input?)`

```ts
type DailyDevBookmarksInput = {
  cursor?: string;
  query?: string;
  limit?: number;
};

type DailyDevBookmarksResult = DailyDevPage<DailyDevPost>;
```

Rules:

1. Requires authenticated user with saved connection.
2. Supports list and search where daily.dev supports it.
3. Missing support returns degraded result, not a broken dashboard.
4. Adding and removing bookmarks may be exposed only where daily.dev supports mutation with the user's token.

## Post details and comments

### `getDailyDevPostDetails(input)`

```ts
type DailyDevPostDetailsInput = {
  postId: string;
};

type DailyDevPostDetails = DailyDevPost & {
  commentsAvailable: boolean;
  comments: Array<{
    id: string;
    bodyPreview: string;
    createdAt?: string;
  }>;
};
```

Rules:

1. Requires authenticated user with saved connection.
2. Fetches post metadata and comments where daily.dev exposes them.
3. Raw comments are never stored in public share snapshots.
4. Missing comments return `commentsAvailable: false` and an empty list.

## Search and tech stack access

### `searchDailyDev(input)`

```ts
type DailyDevSearchInput = {
  query: string;
  cursor?: string;
  limit?: number;
};

type DailyDevSearchResult = DailyDevPage<DailyDevPost>;
```

### `getDailyDevTechStack()`

```ts
type DailyDevTechStackResult = {
  tags: string[];
  degraded: boolean;
  fallbackReason: string | null;
};
```

Rules:

1. Use search for recommendations only where needed.
2. Normalize tags before passing them to scoring or quest personalization.
3. Missing tech stack access returns degraded empty tags.

## Connected activity recording

### `recordDailyDevActivity(input)`

Server action for confirmed user actions in connected mode.

```ts
type RecordDailyDevActivityInput = {
  type: "read" | "upvote" | "bookmark" | "comment" | "share";
  dailyDevPostId: string;
  idempotencyKey: string;
  post: {
    title?: string;
    url?: string;
    tags?: string[];
  };
};
```

Rules:

1. Requires authenticated user.
2. Counts only user action or confirmed API signal, never passive feed fetch.
3. Source normalizes to `dailydev_api` when the event came from API confirmation, otherwise `in_app`.
4. Deduplicates by idempotency key and daily.dev event ID when available.
5. Falls back to Devine-tracked event shape when daily.dev lacks personal read, upvote, comment, or share history.

## Fallback envelope

Connected-mode API failures return safe degraded state instead of blocking the dashboard.

```ts
type DailyDevFallback = {
  degraded: true;
  fallbackReason:
    | "not_connected"
    | "token_invalid"
    | "rate_limited"
    | "dailydev_unavailable"
    | "unsupported"
    | "missing_fields";
  userMessage: string;
};
```

Rules:

1. Demo mode remains usable during daily.dev outage.
2. Existing Devine-tracked state remains visible.
3. Do not retry aggressively during live dashboard render.
4. Do not log tokens, authorization headers, or raw response bodies that may contain secrets.
