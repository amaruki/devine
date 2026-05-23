# 10. Integration Points

## 10.1 daily.dev Public API

| Concern           | Contract                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------- |
| Authentication    | Bearer token from user-provided daily.dev Personal Access Token.                            |
| Used for          | Profile, personalized feed, bookmarks, post metadata, tags, discussions where available.    |
| Not relied on for | Read history, upvote history, personal comment history, and share detection until verified. |
| Failure mode      | Token invalid, rate limited, unavailable, missing fields, or insufficient API access.       |
| Fallback          | Preserve app usability through demo mode and Devine-tracked events.                         |
| Cache policy      | No persistent response cache for MVP. Store only normalized activity events and snapshots.  |
| Timeout           | Connected dashboard fetch should time out and fall back within the NFR budget.              |

## 10.2 Neon Postgres

| Concern        | Contract                                                                                                                     |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Authentication | `DATABASE_URL` environment variable.                                                                                         |
| Used for       | Users, encrypted connections, activity events, daily snapshots, inventory, active effects, optional quests, share snapshots. |
| Failure mode   | Unreachable database, migration mismatch, connection limit.                                                                  |
| Fallback       | Health endpoint reports degraded. Dashboard shows a server error state. Demo mode cannot persist without DB.                 |
| Cache policy   | No cache for MVP.                                                                                                            |

## 10.3 Vercel

| Concern       | Contract                                                     |
| ------------- | ------------------------------------------------------------ |
| Used for      | Hosting Next.js app and route handlers.                      |
| Configuration | Environment variables per `11-environment-configuration.md`. |
| Failure mode  | Build failure, missing env vars, function timeout.           |
| Fallback      | CI and health endpoint detect before demo where possible.    |

## 10.4 Browser session cookie

| Concern      | Contract                                                                                             |
| ------------ | ---------------------------------------------------------------------------------------------------- |
| Used for     | Authenticated account continuity through a signed JWT cookie validated against the `sessions` table. |
| Failure mode | Cookie blocked, cleared, expired, revoked, or token version mismatch.                                |
| Fallback     | Redirect to login or show an auth prompt for private routes. Public share routes remain accessible.  |

## 10.5 External content URLs

Activity events may store post URLs from daily.dev or article metadata. The UI renders them as outbound links and must not use them for server-side fetching unless a future task adds explicit URL validation and fetch behavior.
