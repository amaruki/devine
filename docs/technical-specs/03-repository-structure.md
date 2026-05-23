# 3. Repository Structure

## 3.1 Directory tree

```text
.
├─ app/
│  ├─ (marketing)/
│  │  └─ page.tsx
│  ├─ auth/
│  │  ├─ login/
│  │  │  └─ page.tsx
│  │  ├─ register/
│  │  │  └─ page.tsx
│  │  └─ actions.ts
│  ├─ dashboard/
│  │  ├─ actions.ts
│  │  └─ page.tsx
│  ├─ settings/
│  │  ├─ actions.ts
│  │  └─ page.tsx
│  ├─ share/
│  │  └─ [snapshotId]/
│  │     └─ page.tsx
│  ├─ api/
│  │  ├─ dailydev/
│  │  │  └─ test-connection/
│  │  │     └─ route.ts
│  │  ├─ share-snapshots/
│  │  │  └─ route.ts
│  │  ├─ health/
│  │  │  └─ route.ts
│  │  └─ admin/
│  │     └─ reset-state/
│  │        └─ route.ts
│  ├─ globals.css
│  └─ layout.tsx
├─ components/
│  ├─ dashboard/
│  ├─ duck/
│  ├─ marketing/
│  ├─ settings/
│  ├─ share/
│  └─ ui/
├─ lib/
│  ├─ activity/
│  ├─ dailydev/
│  ├─ db/
│  │  ├─ migrations/
│  │  ├─ seeds/
│  │  ├─ client.ts
│  │  ├─ migrate.ts
│  │  ├─ schema.ts
│  │  └─ seed.ts
│  ├─ demo/
│  ├─ operations/
│  ├─ powerups/
│  ├─ quests/
│  ├─ scoring/
│  ├─ security/
│  ├─ auth/
│  ├─ share/
│  ├─ speech/
│  └─ users/
├─ tests/
│  ├─ e2e/
│  ├─ fixtures/
│  └─ unit/
├─ docs/
│  ├─ technical-specs/
│  ├─ api-specs/
│  └─ business/
├─ scripts/
│  └─ check_index.py
├─ .github/
│  └─ workflows/
│     └─ ci.yml
├─ drizzle.config.ts
├─ next.config.ts
├─ package.json
├─ playwright.config.ts
├─ prettier.config.mjs
├─ tsconfig.json
└─ vitest.config.ts
```

## 3.2 Folder purposes

| Path                       | Purpose                                                                                   |
| -------------------------- | ----------------------------------------------------------------------------------------- |
| `app/`                     | Next.js App Router pages, route handlers, layouts, and route-local server actions.        |
| `app/(marketing)/page.tsx` | Landing page at `/`.                                                                      |
| `app/auth/`                | Registration, login, logout, and account-auth server actions.                             |
| `app/dashboard/`           | Auth-required dashboard surface and dashboard mutations.                                  |
| `app/settings/`            | Token connection, disconnect, demo mode, and reset demo state.                            |
| `app/share/[snapshotId]/`  | Public privacy-safe share snapshot page.                                                  |
| `app/api/`                 | REST contracts for health, reset, daily.dev connection test, and share snapshot creation. |
| `components/duck/`         | SVG duck avatar variants and motion wrappers.                                             |
| `components/ui/`           | Reusable presentational primitives.                                                       |
| `lib/scoring/`             | Pure energy, health, seniority, and tag-normalization logic.                              |
| `lib/quests/`              | Pure quest generation, progress, and rewards.                                             |
| `lib/powerups/`            | Pure inventory, active effect, and power-up use logic.                                    |
| `lib/activity/`            | Activity event normalization and recording.                                               |
| `lib/dailydev/`            | daily.dev API client and response mapping.                                                |
| `lib/security/`            | Token encryption, password hashing helpers, JWT signing, and request hardening helpers.   |
| `lib/auth/`                | Account registration, login, session validation, role checks, and logout orchestration.   |
| `lib/db/`                  | Drizzle client, schema, migrations, seeds, and repositories.                              |
| `lib/demo/`                | Demo personas and simulation actions.                                                     |
| `lib/share/`               | Share snapshot creation and public projection.                                            |
| `lib/speech/`              | Deterministic speech bubble template selection.                                           |
| `lib/operations/`          | Health dependency checks and reset orchestration.                                         |
| `tests/unit/`              | Vitest tests for pure modules and route contracts where possible.                         |
| `tests/e2e/`               | Playwright golden path tests.                                                             |
| `docs/technical-specs/`    | This numbered technical spec set.                                                         |
| `docs/api-specs/`          | Future endpoint contracts for task cards and review.                                      |

## 3.3 File placement rule

Domain rules live in `lib/<module>/` and must be independent of React. Page and component files consume typed view models and call server actions or REST endpoints. Database access stays behind `lib/db/` repositories.
