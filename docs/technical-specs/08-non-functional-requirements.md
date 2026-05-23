# 8. Non-Functional Requirements

## 8.1 Targets

| Category               | Target                                                                                                        | Source                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| Landing comprehension  | Judge understands product hook in under 10 seconds.                                                           | US-01, MVP success criteria  |
| Dashboard initial load | P95 under 2.5 seconds on Vercel preview with seeded demo data.                                                | Hackathon demo requirement   |
| Demo mutation response | P95 under 800 ms for local domain calculation plus database write.                                            | 60-second golden path        |
| Share page load        | P95 under 1.5 seconds because it reads one static snapshot row.                                               | US-14                        |
| Health endpoint        | P95 under 500 ms without daily.dev external check.                                                            | Deployment operability       |
| Token validation       | P95 under 5 seconds excluding daily.dev outage.                                                               | External API dependency      |
| Availability           | Demo mode remains usable when daily.dev is unavailable.                                                       | US-04 and US-15              |
| Data volume per user   | 1,000 activity events, 365 daily snapshots, 100 share snapshots for MVP sizing.                               | Hackathon MVP assumption     |
| Concurrent users       | 50 concurrent demo users for judging and review.                                                              | Hackathon MVP assumption     |
| Rate limits            | Token test no more than 10 attempts per session per hour. Share creation no more than 20 per session per day. | Security and API reliability |
| Test baseline          | `bun run complete-check` must pass on clean scaffold and before PR merge.                                     | Tooling decision             |

## 8.2 Scaling assumptions

Devine does not need a queue, cache, or background worker for MVP. The app recalculates small rolling windows from persisted events on dashboard open and mutation. If activity volume exceeds the target, add precomputed daily aggregates before adding a separate service.

## 8.3 Reliability requirements

1. Demo mode must work without a daily.dev token.
2. Connected mode failures must show a fallback prompt instead of blocking the dashboard.
3. Share pages must render from stored snapshots even if the user's current state changes.
4. Reset-state must restore a known dev or QA state in non-production environments.

## 8.4 Performance budget by path

| Path                      | Budget          | Notes                                                          |
| ------------------------- | --------------- | -------------------------------------------------------------- |
| `/`                       | 1.5 seconds P95 | Static or mostly static marketing route.                       |
| `/dashboard` demo         | 2.5 seconds P95 | Reads user state and calculates dashboard model.               |
| `/dashboard` connected    | 3.5 seconds P95 | Allows one daily.dev fetch with timeout and graceful fallback. |
| `/settings`               | 1.5 seconds P95 | Reads connection status only.                                  |
| `/share/[snapshotId]`     | 1.5 seconds P95 | Public projection from one row.                                |
| `POST /admin/reset-state` | 30 seconds      | Non-production synchronous operation.                          |
