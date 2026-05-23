# 4. Tech Stack

## 4.1 Runtime and language

| Component                 | Technology                               | Justification                                                                     |
| ------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------- |
| Runtime                   | Bun 1.3                                  | Locked by grill. Fast install and script runner for the hackathon MVP.            |
| Language                  | TypeScript 6.0.3 strict mode             | Matches Next.js and Drizzle ecosystem while catching domain model errors early.   |
| Node compatibility target | Node.js 24 APIs where required by Vercel | Keeps server code deployable on Vercel even when Bun is the local package runner. |

## 4.2 Backend

| Component     | Technology                              | Justification                                                                                                |
| ------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Web framework | Next.js 16 App Router                   | Approved stack, SSR support, server actions, route handlers, and Vercel fit.                                 |
| API style     | Server Actions plus REST route handlers | Server Actions reduce dashboard form boilerplate. REST gives stable public and operational contracts.        |
| Validation    | Zod 4.4.3                               | Runtime validation for settings forms, reset-state input, share snapshot creation, and external API mapping. |
| ORM           | Drizzle ORM 0.45.2                      | Approved stack, typed schema, migrations, and Postgres support.                                              |

## 4.3 Frontend

| Component    | Technology                                                                 | Justification                                                                          |
| ------------ | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Rendering    | App Router SSR with client islands                                         | Protects token access server-side while allowing interactive demo controls.            |
| Styling      | Tailwind CSS 4                                                             | Approved stack, fast dark developer UI, and component-level iteration.                 |
| Animation    | motion 12.39.0                                                             | Approved stack for duck bobbing, glow, shake, glitch, melt, sparkle, and energy pulse. |
| Forms        | React server actions with Zod validation                                   | Keeps settings and dashboard mutations simple without adding a form framework.         |
| Client state | Local React state for transient UI, server state refreshed after mutations | Avoids global state unless the MVP proves it needs one.                                |

## 4.4 Datastores and persistence

| Component        | Technology                                     | Justification                                                                                                |
| ---------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Primary database | Neon Postgres 18                               | Approved stack, serverless Vercel fit, and relational integrity for users, events, snapshots, and inventory. |
| Cache            | None for MVP                                   | The dashboard data volume is small and freshness is more valuable than cache complexity.                     |
| Queue            | None for MVP                                   | No background worker is in scope. Missed-day processing runs on dashboard open.                              |
| Object storage   | None for MVP                                   | Image export is out of scope.                                                                                |
| Search           | None for MVP                                   | daily.dev search is external and advanced article analytics are out of scope.                                |
| Migrations       | Drizzle migrations via `bun run db:migrate`    | Versioned schema changes with migration ledger.                                                              |
| Seeds            | `bun run db:seed:dev` and `bun run db:seed:qa` | Separate idempotent seed modes for local development and QA reset.                                           |

## 4.5 Security

| Component          | Technology                                                 | Justification                                                                                               |
| ------------------ | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| App identity       | Username/password accounts with user and superadmin roles  | Locked by business docs. Preserves account-bound ownership for private state, judge accounts, and recovery. |
| Password hashing   | Argon2id with versioned parameters                         | Locked by grill. Modern memory-hard password storage for first-party accounts.                              |
| Session model      | Signed JWT in httpOnly cookie plus database session row    | Locked by grill. Supports AC-required claims, revocation, 7-day expiry, and auditability.                   |
| Token encryption   | Web Crypto AES-GCM with server secret                      | Keeps daily.dev tokens encrypted at rest and usable only server-side.                                       |
| Request validation | Zod schemas at system boundaries                           | Validates external input without over-validating trusted internal calls.                                    |
| Reset auth         | `RESET_STATE_SECRET` bearer header outside production only | Allows QA reset without mounting the route in production.                                                   |

## 4.6 Testing and CI

| Component      | Technology                     | Justification                                                                                    |
| -------------- | ------------------------------ | ------------------------------------------------------------------------------------------------ |
| Unit tests     | Vitest 4.1.7                   | Locked by grill. Fast tests for scoring, quests, power-ups, activity mapping, and share privacy. |
| E2E tests      | Playwright 1.60                | Locked by grill. Verifies landing, demo golden path, dashboard mutation, and share page.         |
| Lint           | oxlint 1.65.0 with Next config | Catches React, TypeScript, and Next.js issues.                                                   |
| Format         | oxfmt 0.51.0                   | Stable formatting gate.                                                                          |
| Type check     | `tsc --noEmit`                 | Separate type gate independent of build.                                                         |
| Aggregate gate | `bun run complete-check`       | Runs type-check, lint, format-check, unit tests, e2e tests, and build.                           |

## 4.7 Deployment

| Component        | Technology     | Justification                                                                                                              |
| ---------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Hosting          | Vercel         | Approved stack and native Next.js deployment.                                                                              |
| Database hosting | Neon           | Approved stack and serverless Postgres fit.                                                                                |
| CI               | GitHub Actions | Standard repo automation for checks before deployment.                                                                     |
| Containers       | None for MVP   | Vercel deployment avoids custom container complexity. Migration runners still avoid absolute paths for future portability. |

## 4.8 What we deliberately do not use

| Tool                     | Reason                                                                                                                              |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| BetterAuth               | Deferred unless OAuth or multi-provider auth becomes MVP scope. First-party username/password auth is small enough to own directly. |
| tRPC                     | Extra setup without clear MVP value because Server Actions and REST cover the contracts.                                            |
| Redis                    | No queue or cache need in the MVP.                                                                                                  |
| Background workers       | Explicit MVP non-goal. Missed-day processing runs on dashboard open.                                                                |
| Image generation service | PNG export is a bonus, not MVP-critical.                                                                                            |
| Full AI chat             | Explicit MVP non-goal. Speech bubbles are deterministic templates.                                                                  |

## 4.9 Version-pinning policy

Package versions are pinned in `package.json` and the `bun.lock` file is committed. Upgrades happen deliberately through a dependency update task that runs `bun run complete-check` before merge.
