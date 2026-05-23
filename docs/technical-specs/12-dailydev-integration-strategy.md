# 12. daily.dev Integration Strategy

This document is the source of truth for daily.dev API integration. Cite this document from task cards and module docs instead of repeating API fallback, mapping, and token-use rules.

## 12.1 Decision matrix

| Concern                | Decision                                                                                                              | Rationale                                                                  |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Primary auth           | User-provided daily.dev Personal Access Token                                                                         | The PRD states the Public API is personalized by Bearer token.             |
| Server-wide token      | Fallback and non-personal content only                                                                                | Prevents app-owned account behavior from being mistaken for user behavior. |
| Personal behavior gaps | Track read, share, upvote confirmation, and discussion confirmation inside Devine when API fields are unavailable     | Removes MVP dependency on uncertain daily.dev endpoints.                   |
| Failure mode           | Connected mode degrades into demo prompt and keeps existing Devine-tracked state                                      | Hackathon demo must remain reliable.                                       |
| Mapping                | Map daily.dev posts into internal post DTOs, then into activity events only after user action or confirmed API signal | Avoids counting passive feed fetches as learning.                          |

## 12.2 Interface and request shape

```ts
export type DailyDevPost = {
  id: string;
  title: string;
  url: string;
  tags: string[];
  source?: string;
  publishedAt?: string;
};

export async function fetchDailyDevFeed(token: string): Promise<DailyDevPost[]>;
export async function fetchDailyDevBookmarks(token: string): Promise<DailyDevPost[]>;
export async function validateDailyDevToken(token: string): Promise<DailyDevProfile>;
```

Token validation is invoked by:

```http
POST /api/dailydev/test-connection
Content-Type: application/json

{ "token": "<personal-access-token>" }
```

The response returns profile metadata and connection status only. It never returns the token.

## 12.3 Performance targets

| Target                     |                                    Value | Source                                   |
| -------------------------- | ---------------------------------------: | ---------------------------------------- |
| Connected dashboard budget |                          3.5 seconds P95 | `08-non-functional-requirements.md §8.4` |
| Token validation budget    | 5 seconds P95 excluding daily.dev outage | `08-non-functional-requirements.md §8.1` |
| Token test rate limit      |         10 attempts per session per hour | `08-non-functional-requirements.md §8.1` |

## 12.4 Rate-limit and security constraints

1. Do not call daily.dev from client components.
2. Do not expose Bearer tokens to the browser.
3. Respect daily.dev rate-limit responses and show a fallback state.
4. Do not retry aggressively during a live dashboard render.
5. Store only normalized data needed for Devine scoring and display.

## 12.5 Component and contract

File layout:

```text
lib/dailydev/
├─ client.ts
├─ mapper.ts
├─ types.ts
└─ index.ts
```

Locked public exports:

```ts
export {
  validateDailyDevToken,
  fetchDailyDevProfile,
  fetchDailyDevFeed,
  fetchDailyDevBookmarks,
} from "./client";
export type { DailyDevProfile, DailyDevPost } from "./types";
```

## 12.6 What this does not do

1. It does not infer personal reads from feed fetches. Activity ingestion owns counted actions.
2. It does not implement OAuth. Authentication strategy is defined in `09-authentication-and-authorization.md`.
3. It does not cache external responses. Persistence owns events and snapshots, not raw API cache.
4. It does not block demo mode when daily.dev fails. Demo fallback is required by `01-overview.md §1.6`.

## 12.7 Cross-references

| Related concern        | Source                                  |
| ---------------------- | --------------------------------------- |
| Token encryption       | `07-security.md §7.3`                   |
| Activity normalization | `05-module-definitions.md §5.4`         |
| External failure modes | `10-integration-points.md §10.1`        |
| Environment variables  | `11-environment-configuration.md §11.1` |

## 12.8 Open follow-ups

1. Verify exact daily.dev OpenAPI endpoints for profile, feed, bookmarks, post details, and comments when API access is available.
2. Revisit OAuth only if daily.dev officially supports it for hackathon apps.
3. Add response caching only if dashboard latency exceeds the connected-mode NFR.
