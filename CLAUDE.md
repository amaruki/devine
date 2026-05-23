# Devine Agent Manual

Devine is a Bun-run Next.js 16 App Router app that turns daily.dev reading activity into a rubber duck companion, quests, power-ups, and privacy-safe share snapshots.

If context is compacted, re-read this file before touching code. Run the verification gate before marking any implementation task complete.

## Source of truth

| Concern                                      | Source                    |
| -------------------------------------------- | ------------------------- |
| Product, users, acceptance criteria          | `docs/business/`          |
| Architecture, stack, modules, data, security | `docs/technical-specs/`   |
| Coding rules                                 | `docs/CODING_STANDARD.md` |
| Work model and card ownership                | `docs/TASK_BREAKDOWN.md`  |
| Deployment and operations                    | `docs/DEPLOYMENT_PLAN.md` |
| Domain language                              | `docs/GLOSSARY.md`        |
| API contracts                                | `docs/api-specs/`         |

This manual restates load-bearing rules. If it conflicts with the source docs, fix this file.

## Project overview

| Layer      | Technology                                                |
| ---------- | --------------------------------------------------------- |
| Runtime    | Bun 1.3.1, Node.js 24 APIs where Vercel requires them     |
| Framework  | Next.js 16.0.4 App Router, React 19.2.0                   |
| Language   | TypeScript 6.0.3 strict mode                              |
| Styling    | Tailwind CSS 4.1.17                                       |
| Animation  | motion 12.39.0                                            |
| Validation | Zod 4.4.3                                                 |
| Database   | Neon Postgres 18 through Drizzle ORM 0.45.2               |
| Tests      | Bun test, Vitest-compatible unit style, Playwright 1.60.0 |
| Quality    | oxlint 1.65.0, oxfmt 0.51.0, `tsc --noEmit`               |
| Hosting    | Vercel with Neon Postgres                                 |

```text
app/                  Next.js routes, layouts, route handlers, server actions
app/(marketing)/      Landing page at /
app/auth/             Register, login, logout, account auth actions
app/dashboard/        Auth-required dashboard and dashboard mutations
app/settings/         Token connection, demo mode, reset demo state
app/share/[snapshotId]/ Public share snapshot route
app/api/              REST contracts for health, reset, daily.dev, share snapshots
features/<slice>/     Vertical slices with domain, application, infrastructure, presentation, tests
features/activity/    Activity normalization and recording
features/auth/        Registration, login, sessions, roles, logout
features/dailydev/    daily.dev API client and response mapping
features/demo/        Demo personas and simulation actions
features/operations/  Health checks and reset orchestration
features/powerups/    Inventory, active effects, power-up use
features/quests/      Quest generation, progress, rewards
features/scoring/     Energy, health, seniority, tag normalization
features/share/       Share snapshot creation and public projection
features/speech/      Deterministic speech templates
features/users/       User domain boundary
components/           Shared route components and reusable UI primitives
components/ui/        Presentation-only primitives
lib/db/               Drizzle client, schema, migrations, seeds, repositories
lib/security/         Cross-cutting security primitives
tests/e2e/            Playwright golden paths
docs/                 Business, technical, API, workflow docs
scripts/              Repository helper scripts
```

## Boundaries

| Module                | Owns                                    | Public contract                                                                                           |
| --------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Dashboard UI          | Routes and typed view model composition | `app/(marketing)`, `app/dashboard`, `app/settings`, `components/*`                                        |
| Auth                  | Users, sessions, roles, logout          | `registerUser`, `loginUser`, `logoutUser`, `requireUser`, `requireSuperadmin`                             |
| daily.dev integration | API calls and DTO mapping               | `validateDailyDevToken`, `fetchDailyDevProfile`, `fetchDailyDevFeed`, `fetchDailyDevBookmarks`            |
| Token security        | Encrypted PAT lifecycle                 | `encryptToken`, `decryptToken`, `deleteDailyDevConnection`                                                |
| Activity ingestion    | Normalized events                       | `normalizeActivityEvent`, `recordActivity`                                                                |
| Scoring               | Pure energy, health, seniority, tags    | `calculateDailyEnergy`, `calculateHealth`, `processMissedDays`, `calculateSeniorityScore`, `normalizeTag` |
| Quests                | Quest generation, progress, rewards     | `generateQuests`, `calculateQuestProgress`, `claimQuestReward`                                            |
| Power-ups             | Inventory and effects                   | `addPowerUp`, `usePowerUp`, `consumeMatchingEffect`                                                       |
| Demo mode             | Persona state and simulation actions    | `getDemoPersona`, `applyDemoAction`, `resetDemoState`                                                     |
| Persistence           | All tables and direct database access   | `lib/db/schema.ts`, `client.ts`, `repositories/*`, `migrate.ts`, `seed.ts`                                |
| Share snapshots       | Static public projections               | `createShareSnapshot`, `getPublicShareSnapshot`, `softDeleteShareSnapshot`                                |
| Operations            | Health and reset state                  | `GET /api/health`, non-production `POST /api/admin/reset-state`                                           |

Hard domain states:

- Roles are `user` and `superadmin`.
- User modes are `demo` and `connected`.
- Activity types are `read`, `upvote`, `bookmark`, `comment`, and `share`.
- Activity sources are `dailydev_api`, `in_app`, `manual`, and `demo`.
- Quest statuses are `active`, `completed`, and `claimed`.
- Health states are `thriving`, `stable`, `tired`, `sick`, `critical`, and `hibernating`.
- Seniority levels are `ignorant_copaster`, `code_monkey`, `grounded_scholar`, and `tech_philosopher`.
- Demo personas are `copaster`, `code_monkey`, `scholar`, and `philosopher`.
- Public share IDs are URL-safe `public_id` values such as `devine_abc123`, never internal UUIDs.

## Work model

- Cards come from `docs/TASK_BREAKDOWN.md` and cite acceptance criteria under `docs/business/`.
- TL cards establish API specs, scaffold, guardrails, seeds, and release checks.
- Backend cards implement persistence, domain engines, server actions, and route handlers against approved contracts.
- Frontend cards own routes, components, loading states, error states, visual polish, and manual UI verification.
- Wiring cards prove frontend and backend behavior end-to-end in the running app.
- US-21 recovery implementation is optional follow-up, but contracts remain documented.

## Architecture laws

- Put new product behavior in `features/<slice>/` with domain, application, infrastructure, presentation, and tests layers.
- Keep domain rules in `features/<slice>/domain/` and independent of React, Next page modules, Drizzle, cookies, environment variables, and network clients.
- Keep route handlers and server actions thin: validate input, authorize caller, call public feature APIs, map results.
- Put all direct database access, Drizzle clients, schema, migrations, seeds, and repositories under `lib/db/`.
- Use repositories, ports, or infrastructure adapters outside `lib/db/`; do not import `db` elsewhere.
- Import migrated feature modules through public entry points such as `@/features/auth` and `@/features/share`, not private implementation files.
- Keep slice tests under `features/<slice>/tests/`; keep `tests/e2e/` for cross-slice browser flows.
- Keep `components/ui/` presentation-only. They must not fetch data or mutate state.
- Keep application source files under 300 lines. Split proactively at 250 lines.
- Split large files into a sibling feature folder or focused module. Keep entry points thin and avoid generic `utils` dumps.
- Put every atomic multi-step write in one transaction.
- Do not add queues, caches, Redis, background workers, tRPC, BetterAuth, image generation services, or AI chat for MVP code.

## Runtime do and do not

| Do                                                    | Do not                                                |
| ----------------------------------------------------- | ----------------------------------------------------- |
| Use Bun for installs and scripts                      | Do not introduce npm, pnpm, yarn, or another lockfile |
| Use exact pinned dependency versions                  | Do not add caret or tilde dependency ranges           |
| Use Server Actions plus REST route handlers           | Do not add tRPC for MVP contracts                     |
| Use Zod at system boundaries                          | Do not over-validate trusted internal calls           |
| Use Drizzle migrations through the ledger             | Do not apply raw SQL files manually                   |
| Use `bun run format:write` for formatting             | Do not hand-format around oxfmt                       |
| Use demo mode for reliable fallback                   | Do not make daily.dev availability required for demos |
| Use Vercel dashboard for production deploy visibility | Do not use containers or custom server deployment     |

## Verification gate

Before any implementation task is complete, run this ordered gate:

```bash
bun run type-check
bun run lint
bun run format
bun run test
bun run test:e2e
bun run build
```

`bun run complete-check` runs the same gate in order. For UI or frontend work, also start the app with `bun run dev` and manually verify the golden path, loading, empty, and error states in a browser.

## Code discovery protocol

1. Search before writing new code.
2. Read the closest existing route, module, repository, component, and test.
3. Reuse existing types, schemas, repositories, services, and UI primitives.
4. Verify acceptance criteria and source docs before changing contracts.
5. Update source docs when route contracts, folder responsibilities, security rules, environment variables, or verification commands change.

## Naming

| Element                     | Pattern               | Example                                            |
| --------------------------- | --------------------- | -------------------------------------------------- |
| Folders                     | lowercase kebab-case  | `dailydev-integration`                             |
| Next framework files        | fixed lowercase names | `page.tsx`, `layout.tsx`, `actions.ts`, `route.ts` |
| React components            | PascalCase            | `DuckAvatar`                                       |
| Type aliases                | PascalCase            | `HealthResponse`                                   |
| Functions and variables     | camelCase             | `validateDailyDevToken`                            |
| Drizzle table exports       | camelCase             | `dailyDevConnections`                              |
| Database tables and columns | snake_case            | `daily_dev_profile_id`                             |
| Static quest keys           | snake_case            | `feed_the_duck`                                    |
| Public share IDs            | URL-safe string       | `devine_abc123`                                    |

## Type safety

- Keep strict TypeScript clean.
- Do not use `any`, unchecked `as`, or non-null assertions.
- Give exported non-component functions explicit return types.
- Use literal unions and discriminated unions for finite domain states and expected outcomes.
- Derive request and response types from Zod schemas with `z.infer` where possible.

## Error handling

- Return discriminated result unions for expected validation, auth, user-facing, and integration failures.
- Throw only for impossible invariants and missing required server configuration.
- Map service results to HTTP status codes or form state at boundaries.
- Do not leak raw exception messages, secrets, or environment values to public responses.
- Use `Response.json` with explicit response shapes in route handlers.

## Testing

- Put slice tests in `features/<slice>/tests/` and E2E tests in `tests/e2e/`.
- Use Arrange, Act, Assert form.
- Test every acceptance-criterion path that changes behavior.
- Cover success, expected failure, authorization boundaries, privacy projection, idempotency, and persistence side effects.
- Mock only external boundaries such as daily.dev, time, and database clients at the deepest practical boundary.
- Do not mock intermediate services to test their callers.

## Database

- All primary keys are UUID strings generated by the application or database.
- Store timestamps as `timestamptz` in UTC.
- Mutable tables include `created_at` and `updated_at`; append-only event tables include `created_at` only.
- Run migrations with `bun run db:migrate`.
- Run seeds with `bun run db:seed:dev` or `bun run db:seed:qa`.
- Migration runners must resolve migrations relative to their module and use `DATABASE_URL`.
- Never hardcode absolute migration paths, inline connection strings, or arbitrary seed file paths.
- Reset accepts only `dev` or `qa` seeds.

## Security and privacy

- Passwords are Argon2id hashes with versioned parameters. Never store or log plaintext passwords.
- Sessions use signed JWTs in httpOnly cookies plus `sessions` table validation.
- Session claims are `userId`, `username`, `role`, `sessionId`, `iat`, `exp`, and `tokenVersion`.
- Cookies are `SameSite=Lax`, 7-day expiry, and `Secure` in production.
- daily.dev Personal Access Tokens are integration credentials, not login credentials.
- Store daily.dev tokens encrypted server-side with AES-GCM and `DAILYDEV_TOKEN_ENCRYPTION_KEY`.
- Never expose tokens, encrypted-token internals, database URLs, auth headers, passwords, or session secrets to the browser, logs, public JSON, or share snapshots.
- Read environment variables through one server-only Zod-validated config module.
- Client code may read only safe `NEXT_PUBLIC_*` values.
- Enforce owner scope on every private mutation.
- Superadmins may provision and reset judge demo accounts, but may not bypass token secrecy or public share privacy.
- `GET /api/health` is public and secret-free.
- `POST /api/admin/reset-state` must be absent in production and bearer-protected outside production.
- Public share snapshots may expose only seniority level, seniority score, health state, top tags, speech bubble, generated date, and powered-by attribution.

## Environment invariants

| Variable                        | Rule                                                            |
| ------------------------------- | --------------------------------------------------------------- |
| `APP_ENV`                       | `development`, `test`, `qa`, or `production`                    |
| `DATABASE_URL`                  | Required server-side for Drizzle, migrations, and seeds         |
| `DAILYDEV_TOKEN_ENCRYPTION_KEY` | Required base64 256-bit AES-GCM key                             |
| `SESSION_SECRET`                | Required high-entropy JWT signing secret                        |
| `RESET_STATE_SECRET`            | Required only outside production when reset API is enabled      |
| `ENABLE_RESET_API`              | `true` only outside production, absent or `false` in production |
| `DEFAULT_SEED`                  | Optional local helper, normally `dev` or `qa`                   |
| `DAILYDEV_SERVER_TOKEN`         | Optional, non-personal fallback only                            |
| `NEXT_PUBLIC_APP_URL`           | Required public base URL, not secret                            |

In production, `APP_ENV=production`, `ENABLE_RESET_API` is absent or `false`, `RESET_STATE_SECRET` is absent, and reset-state is not registered.

## Git

- Use Conventional Commits with imperative summaries, such as `feat: add dailydev token validation route`.
- Use prefixes such as `feat:`, `fix:`, `test:`, `docs:`, `refactor:`, and `chore:`.
- Do not require AI co-author trailers.
- Do not commit secrets, `.env.local`, credentials, generated test artifacts, or unrelated local files.
- Vercel deploys automatically when `main` is updated.
- Before schema-changing deployment work, create a Neon branch or snapshot and coordinate timing with the project owner.

## Absolute prohibitions

| Violation                                                                            | Why                                                       |
| ------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| `any`, unchecked casts, or non-null assertions                                       | Type gaps become correctness and privacy bugs             |
| Business logic in route handlers or server actions                                   | Boundaries must stay thin and testable                    |
| React imports in domain modules                                                      | Domain behavior must be testable without rendering        |
| Direct `db` imports outside `lib/db/`                                                | Data access must stay behind repositories and services    |
| Cross-module private imports                                                         | Feature modules must remain movable and reviewable        |
| Broad CORS headers                                                                   | Sessions and tokens are same-origin assets                |
| `dangerouslySetInnerHTML` for user or API content                                    | React escaping is the XSS control                         |
| Plaintext token, password, or authorization logging                                  | The app handles credentials and personal daily.dev access |
| Reset endpoint in production                                                         | Production data must never be reset                       |
| Public share raw activity, user IDs, profile IDs, comments, emails, or article lists | Share pages expose only allowlisted aggregates            |
| Queues, caches, Redis, workers, BetterAuth, tRPC, image generation, or AI chat       | Explicit MVP non-goals                                    |
| Hardcoded migration paths, raw SQL migration application, or arbitrary seed paths    | Bypasses Drizzle ledger and breaks deploy portability     |
| Commented-out code, dead code, TODO, or FIXME markers                                | Partial work must not hide in merged code                 |

## Context recovery checklist

After compaction or handoff, verify these invariants before editing:

- [ ] Bun is the only package and script runner.
- [ ] `bun run complete-check` is the full merge gate.
- [ ] Source files stay under 300 lines and split at 250.
- [ ] Domain logic stays in `features/<slice>/domain/`, independent of React.
- [ ] Database access stays behind `lib/db/` repositories, feature ports, or infrastructure adapters.
- [ ] Users have roles `user` or `superadmin`.
- [ ] User modes transition between `demo` and `connected` only.
- [ ] Health states include `hibernating`, not permanent death.
- [ ] Revive Feather applies only when health is 0 through 9 and sets recovery to the documented path.
- [ ] Power-ups affect energy or health, never seniority or stored activity history.
- [ ] Missed-day processing runs on dashboard open, not a worker.
- [ ] daily.dev failures are recoverable and demo mode keeps working.
- [ ] Tokens are AES-GCM encrypted server-side and never serialized to clients.
- [ ] Public share pages read only public projection fields by `public_id`.
- [ ] Reset-state is absent in production and accepts only `dev` or `qa` outside production.
- [ ] Conventional Commits are used without required AI co-author trailers.

## Quick reference

```bash
bun install --frozen-lockfile
bun run dev
bun run type-check
bun run lint
bun run format
bun run format:write
bun run test
bun run test:e2e
bun run build
bun run complete-check
bun run db:migrate
bun run db:seed:dev
bun run db:seed:qa
curl "$NEXT_PUBLIC_APP_URL/api/health"
curl -X POST "$NEXT_PUBLIC_APP_URL/api/admin/reset-state" -H "Authorization: Bearer $RESET_STATE_SECRET" -H "Content-Type: application/json" -d '{"seed":"dev"}'
```
