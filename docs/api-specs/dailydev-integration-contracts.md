# daily.dev Integration API Contracts

**Version:** 1.0.0  
**Date:** 2026-05-24  
**Author:** Claude Code  
**Status:** Approved  
**Phase:** Sprint 4

## Scope

Covers daily.dev token validation, token persistence, token revocation, connected-mode reads, external API fallback envelopes, pagination, profile/feed/bookmark/post/comment access, and demo fallback behavior.

Serves: AC-03.01, AC-03.02, AC-03.03, AC-03.04, AC-03.05, AC-03.06, AC-03.07, AC-03.08, AC-03.09, AC-15.01, AC-15.02, AC-15.03, AC-15.04, AC-15.05, AC-17.01, AC-17.02, AC-17.03, AC-17.04, AC-17.05, AC-17.06, AC-17.07, AC-17.08, AC-17.09

Sources: `../business/acceptance-criteria-breakdown/acceptance-criteria-sprint-4.md`, `../technical-specs/05-module-definitions.md`, `../technical-specs/06-data-model.md`, `../technical-specs/07-security.md`, `../technical-specs/08-non-functional-requirements.md`, `../technical-specs/10-integration-points.md`, `../technical-specs/12-dailydev-integration-strategy.md`

## Prerequisites (AC-03.02)

daily.dev Public API access requires an active [daily.dev Plus](https://daily.dev/plus) subscription. The Settings UI must explain this requirement so users understand why a token alone may not be sufficient. Without Plus, daily.dev returns `403` for authenticated endpoints even with a valid token.

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

## Token revocation guidance (AC-03.09)

The Settings UI must display a reminder that users can revoke their daily.dev Personal Access Token at any time through [daily.dev API settings](https://daily.dev/settings/api-tokens). This guidance appears:

1. After a successful token connection, as a reminder that the token can be revoked.
2. When the user clicks "Disconnect", as confirmation that revoking on daily.dev is an additional step they may want to take.
3. When a token becomes invalid, as a reminder that the old token may need revocation if it was compromised.

## Later invalid token handling (AC-03.10)

When a previously connected token fails validation during dashboard load or an authenticated API call:

1. Return `degraded: true` with `fallbackReason: "token_invalid"`.
2. Show a reconnect prompt in the UI with options to:
   - Reconnect with a new token (navigate to Settings).
   - Switch to demo mode (keep using Devine without daily.dev data).
3. Preserve existing Devine-tracked state and any previously normalized events.
4. Do not automatically delete the saved token. Let the user choose to disconnect or reconnect.
5. The user remains in `connected` mode with a degraded state until they take action.

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
    | "missing_fields"
    | "plus_required";
  userMessage: string;
  retryAfter?: string;
  rateLimitInfo?: {
    limit: number;
    remaining: number;
    reset: string;
  };
};
```

Rules:

1. Demo mode remains usable during daily.dev outage.
2. Existing Devine-tracked state remains visible.
3. Do not retry aggressively during live dashboard render.
4. Do not log tokens, authorization headers, or raw response bodies that may contain secrets.

## Rate-limit handling (AC-15.03, AC-15.04, AC-15.05)

### HTTP 429 Response Processing

When daily.dev returns `HTTP 429 Too Many Requests`:

1. Read the `Retry-After` header (seconds) or `retryAfter` field from the response body.
2. Store the retry timestamp and refuse new requests until that time has passed.
3. Return `degraded: true` with `fallbackReason: "rate_limited"` and `retryAfter` ISO timestamp.
4. Do not retry within the same request. Return the degraded state immediately.

### Rate-limit Headers (AC-15.05)

The API client must read and respect these headers when present:

| Header                  | Purpose                                |
| ----------------------- | -------------------------------------- |
| `x-ratelimit-limit`     | Maximum requests per window.           |
| `x-ratelimit-remaining` | Remaining requests in current window.  |
| `x-ratelimit-reset`     | Unix timestamp when the window resets. |

When `x-ratelimit-remaining` is low (≤ 5), log a warning and consider pre-emptive fallback to reduce user impact.

### Rate-limit State

```ts
type RateLimitState = {
  limited: boolean;
  retryAfter: string | null;
  limit: number | null;
  remaining: number | null;
  resetAt: string | null;
};
```

## Endpoint assumptions and risks

These endpoint paths are assumed based on daily.dev Public API documentation and must be verified when API access is available:

| Endpoint                   | Method | Purpose                      | Risk Level |
| -------------------------- | ------ | ---------------------------- | ---------- |
| `GET /feeds/foryou`        | GET    | Personalized feed            | Medium     |
| `GET /user`                | GET    | Profile details              | Low        |
| `GET /bookmarks`           | GET    | User bookmarks               | Medium     |
| `POST /bookmarks`          | POST   | Add bookmark                 | High       |
| `DELETE /bookmarks/{id}`   | DELETE | Remove bookmark              | High       |
| `GET /posts/{id}`          | GET    | Post details                 | Low        |
| `GET /posts/{id}/comments` | GET    | Post comments                | Medium     |
| `GET /search`              | GET    | Search posts/tags            | Medium     |
| `GET /tech-stack`          | GET    | Tech stack tags              | Medium     |
| `GET /user/history`        | GET    | Personal read/upvote history | High       |

**Risk levels:**

- **Low**: Documented in public API docs, high confidence.
- **Medium**: Documented but pagination or field structure unverified.
- **High**: May not exist, may require Plus, or may not return personal data.

**Fallback for high-risk endpoints:** Use Devine-tracked events with `source: "in_app"` or `source: "manual"` instead of `dailydev_api`.

## Downstream contract checklist

| Backend card | Contracts consumed                                                                  |
| ------------ | ----------------------------------------------------------------------------------- |
| BE-S4-01     | `TestConnectionInput`, `DailyDevConnectionStatus`, token validation rules           |
| BE-S4-02     | `disconnectDailyDev`, token revocation guidance, later invalid token handling       |
| BE-S4-03     | `DailyDevPost`, `DailyDevPage`, pagination, rate-limit handling, all endpoint types |
| BE-S4-04     | `RecordDailyDevActivityInput`, activity source normalization                        |
| BE-S4-05     | `DailyDevFallback`, retry-after, rate-limit headers, degraded state handling        |
| FE-S4-01     | `DailyDevConnectionStatus`, connection status UI, reconnect prompts                 |
| FE-S4-02     | `DailyDevFallback`, degraded states, demo mode fallback                             |
| FE-S4-03     | All contract types, end-to-end wiring validation                                    |
