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
│  │  ├─ actions.ts
│  │  └─ require-user.ts
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
├─ features/
│  ├─ auth/
│  │  ├─ application/
│  │  ├─ domain/
│  │  ├─ infrastructure/
│  │  ├─ presentation/
│  │  ├─ tests/
│  │  └─ index.ts
│  ├─ share/
│  │  ├─ application/
│  │  ├─ domain/
│  │  ├─ infrastructure/
│  │  ├─ presentation/
│  │  ├─ tests/
│  │  └─ index.ts
│  └─ <slice>/
│     ├─ application/
│     ├─ domain/
│     ├─ infrastructure/
│     ├─ presentation/
│     ├─ tests/
│     └─ index.ts
├─ components/
│  ├─ duck/
│  └─ ui/
├─ lib/
│  ├─ activity/
│  ├─ dailydev/
│  ├─ db/
│  │  ├─ migrations/
│  │  ├─ repositories/
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

| Path                               | Purpose                                                                                                                                                       |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/`                             | Next.js App Router pages, route handlers, layouts, and route-local server actions. These files adapt HTTP, cookies, redirects, and rendering to feature APIs. |
| `app/api/`                         | REST contracts for health, reset, daily.dev connection test, and share snapshot creation.                                                                     |
| `features/<slice>/`                | Product-owned vertical slice with clean architecture layers and a public `index.ts`.                                                                          |
| `features/<slice>/domain/`         | Pure domain state, value objects, finite-state rules, calculations, and privacy projections.                                                                  |
| `features/<slice>/application/`    | Use cases, `ports.ts`, command/query handlers, result unions, and slice-level request schemas.                                                                |
| `features/<slice>/infrastructure/` | Runtime wiring and adapters that implement application ports through external APIs, session/token services, and `lib/db` repositories.                        |
| `features/<slice>/presentation/`   | Feature-owned React components, view models, and UI mappers.                                                                                                  |
| `features/<slice>/tests/`          | Co-located unit and integration-style tests for the slice domain, application, and presentation adapters.                                                     |
| `components/duck/`                 | Shared duck avatar variants used by multiple surfaces. Move here only while reused across slices.                                                             |
| `components/ui/`                   | Reusable presentation-only primitives.                                                                                                                        |
| `lib/db/`                          | Drizzle client, schema, migrations, seeds, and low-level repositories.                                                                                        |
| `lib/security/`                    | Cross-cutting security primitives that are not owned by one product slice.                                                                                    |
| `tests/e2e/`                       | Playwright golden path tests that cross feature and route boundaries.                                                                                         |
| `docs/technical-specs/`            | This numbered technical spec set.                                                                                                                             |
| `docs/api-specs/`                  | Endpoint contracts for task cards and review.                                                                                                                 |

## 3.3 File placement rule

Product behavior belongs in `features/<slice>/` and follows the layer dependency rules in `02-system-architecture.md`. `app/` files call public feature exports and do not contain business rules. Direct database access stays under `lib/db/`; feature application code reaches persistence through ports, repositories, or infrastructure adapters.
