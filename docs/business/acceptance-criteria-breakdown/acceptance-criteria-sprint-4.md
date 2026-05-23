# Acceptance Criteria — Sprint 4

## User Stories in Scope

- **US-03** An active daily.dev Personal Access Token — Developer
- **US-15** Devine fall back gracefully when daily.dev API data is unavailable — Developer
- **US-17** Daily.dev Public API data within documented API constraints — Developer

---

## US-03 — An active daily.dev Personal Access Token (Developer)

### AC-03.01 — Token connection

```gherkin
Given the Developer is using Devine
When token connection
Then Authenticated user can submit a daily.dev Personal Access Token from settings
```

### AC-03.02 — Plus requirement copy

```gherkin
Given the Developer is using Devine
When plus requirement copy
Then Settings explains that daily.dev Public API requires an active Plus subscription
```

### AC-03.03 — Token auth format

```gherkin
Given the Developer is using Devine
When token auth format
Then Server calls daily.dev with `Authorization: Bearer <token>`
```

### AC-03.04 — Token security

```gherkin
Given the Developer is using Devine
When token security
Then Token is encrypted server-side with environment-managed encryption keys and is never exposed to the browser
```

### AC-03.05 — Active token validation

```gherkin
Given the Developer is using Devine
When active token validation
Then Token validation makes an authenticated `GET /feeds/foryou` request and treats a successful response as an active connected token
```

### AC-03.06 — Validation success

```gherkin
Given the Developer is using Devine
When validation success
Then Settings shows connected status only after the active token check succeeds
```

### AC-03.07 — Validation failure

```gherkin
Given the Developer is using Devine
When validation failure
Then Missing token, unauthorized token, non-Plus access, rate-limit, and network failure states show clear, friendly error copy and do not replace a working connection
```

### AC-03.08 — Disconnect

```gherkin
Given the Developer is using Devine
When disconnect
Then User can disconnect daily.dev and delete the stored token
```

### AC-03.09 — Token revocation guidance

```gherkin
Given the Developer is using Devine
When token revocation guidance
Then Settings reminds users they can revoke tokens in daily.dev API settings
```

### AC-03.10 — Later invalid token

```gherkin
Given the Developer is using Devine
When later invalid token
Then If a connected token later fails validation, Devine shows reconnect guidance and offers demo mode
```

---

## US-15 — Devine fall back gracefully when daily.dev API data is unavailable (Developer)

### AC-15.01 — API failure fallback

```gherkin
Given the Developer is using Devine
When aPI failure fallback
Then Failed daily.dev requests show a graceful fallback rather than crashing the app
```

### AC-15.02 — Server token limit

```gherkin
Given the Developer is using Devine
When server token limit
Then Server-wide daily.dev token is used only for fallback, demo, or non-personal content
```

### AC-15.03 — Rate limit handling

```gherkin
Given the Developer is using Devine
When rate limit handling
Then API client respects documented daily.dev rate-limit behavior and recoverable 429 responses
```

### AC-15.04 — Retry-after handling

```gherkin
Given the Developer is using Devine
When retry-after handling
Then HTTP 429 responses use `retryAfter` or retry-after data before retrying or show a recoverable rate-limit state
```

### AC-15.05 — Rate limit headers

```gherkin
Given the Developer is using Devine
When rate limit headers
Then API client reads `x-ratelimit-limit`, `x-ratelimit-remaining`, and `x-ratelimit-reset` where available
```

### AC-15.06 — Missing history fallback

```gherkin
Given the Developer is using Devine
When missing history fallback
Then Read history, upvote history, comment history, and share detection use daily.dev data only where exposed by the API; otherwise Devine uses in-app tracked or user-reported events marked by source
```

---

## US-17 — Daily.dev Public API data within documented API constraints (Developer)

### AC-17.01 — Base URL

```gherkin
Given the Developer is using Devine
When base URL
Then daily.dev client uses `https://api.daily.dev/public/v1`
```

### AC-17.02 — Feed access

```gherkin
Given the Developer is using Devine
When feed access
Then App can fetch personalized feeds and cursor-paginate through results
```

### AC-17.03 — Post access

```gherkin
Given the Developer is using Devine
When post access
Then App can fetch post details and comments where available
```

### AC-17.04 — Search access

```gherkin
Given the Developer is using Devine
When search access
Then App can search posts, tags, and sources where needed for recommendations
```

### AC-17.05 — Bookmark access

```gherkin
Given the Developer is using Devine
When bookmark access
Then App can list, search, add, and remove bookmarks where supported
```

### AC-17.06 — Profile access

```gherkin
Given the Developer is using Devine
When profile access
Then App can fetch daily.dev profile details for connected mode
```

### AC-17.07 — Tech stack access

```gherkin
Given the Developer is using Devine
When tech stack access
Then App can fetch tech stack data for personalization where available
```

### AC-17.08 — Unsupported behavior fallback

```gherkin
Given the Developer is using Devine
When unsupported behavior fallback
Then Read history, upvote history, comment history, and share detection fall back to Devine in-app tracking or user-reported events when not exposed by API
```

### AC-17.09 — Pagination

```gherkin
Given the Developer is using Devine
When pagination
Then Cursor-based pagination follows `pagination.cursor` while `pagination.hasNextPage` is true
```

---
