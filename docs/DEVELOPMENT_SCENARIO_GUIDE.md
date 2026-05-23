# Devine Development Scenario Guide

Devine development work starts from documented sprint cards and ends with a verified running app.

## Table of Contents

- [Scenario 1: Set up a new checkout](#scenario-1-set-up-a-new-checkout)
- [Scenario 2: Pick up a sprint card](#scenario-2-pick-up-a-sprint-card)
- [Scenario 3: Implement a backend card](#scenario-3-implement-a-backend-card)
- [Scenario 4: Implement a frontend card](#scenario-4-implement-a-frontend-card)
- [Scenario 5: Implement an API contract card](#scenario-5-implement-an-api-contract-card)
- [Scenario 6: Wire a feature end-to-end](#scenario-6-wire-a-feature-end-to-end)
- [Scenario 7: Reset local state](#scenario-7-reset-local-state)
- [Scenario 8: Review a PR](#scenario-8-review-a-pr)
- [Scenario 9: Prepare a release update](#scenario-9-prepare-a-release-update)

## Scenario 1: Set up a new checkout

Use this when you have just cloned the repository.

1. Install dependencies.

```bash
bun install --frozen-lockfile
```

2. Create local environment configuration.

```bash
cp .env.example .env.local
```

3. Fill `.env.local` with local values. Use [.env.example](.env.example) and [docs/technical-specs/11-environment-configuration.md](docs/technical-specs/11-environment-configuration.md) as the source of truth.

4. Run migrations and local seed data.

```bash
bun run db:migrate
bun run db:seed:dev
```

5. Start the app.

```bash
bun run dev
```

6. Open `http://localhost:3000` and confirm the landing page renders.

7. Confirm health.

```bash
curl "$NEXT_PUBLIC_APP_URL/api/health"
```

8. Run the full verification gate.

```bash
bun run complete-check
```

## Scenario 2: Pick up a sprint card

Use this for any planned feature, fix, or scaffold-completion task.

1. Open [docs/TASK_BREAKDOWN.md](docs/TASK_BREAKDOWN.md).

2. Choose one card. Note its card ID, owner role, acceptance criteria, and linked docs.

3. Read the acceptance criteria under [docs/business/](docs/business/).

4. Read the linked API specs, module specs, architecture specs, and security docs.

5. Inspect the current implementation in `app/`, `lib/`, `components/`, and `tests/`.

6. Decide whether the task is backend, frontend, tech-lead contract, or wiring work.

7. Keep scope to the card. Do not add future sprint behavior unless the card requires it.

8. Before handoff, run the checks that match the change and then the full gate.

```bash
bun run complete-check
```

## Scenario 3: Implement a backend card

Use this for persistence, domain logic, route handlers, server actions, auth, daily.dev, scoring, quest, power-up, demo, share, reset, or health behavior.

1. Start from the card in [docs/TASK_BREAKDOWN.md](docs/TASK_BREAKDOWN.md).

2. Read the relevant API contract in [docs/api-specs/](docs/api-specs/) if the work touches a route or server action.

3. Read the relevant module spec in [docs/technical-specs/05-module-definitions.md](docs/technical-specs/05-module-definitions.md).

4. Add or update unit tests in `tests/unit/` for pure behavior, route contracts, validation, authorization, idempotency, and privacy boundaries.

5. Implement domain logic under the relevant `lib/<module>/` folder.

6. Keep direct database access in `lib/db/`.

7. Keep route handlers and server actions thin. They should validate input, authorize the caller, call services, and map results to responses.

8. Run focused checks.

```bash
bun run type-check
bun run test
```

9. If the change affects formatting or lint rules, run:

```bash
bun run lint
bun run format
```

10. Run the full gate before handoff.

```bash
bun run complete-check
```

11. Update the relevant docs if contracts, environment variables, architecture, or verification commands changed.

## Scenario 4: Implement a frontend card

Use this for landing, auth, dashboard, settings, share pages, components, loading states, empty states, error states, or visual polish.

1. Start from the card in [docs/TASK_BREAKDOWN.md](docs/TASK_BREAKDOWN.md).

2. Read the relevant route, UI, and acceptance criteria docs.

3. Inspect the current page or component under `app/` and `components/`.

4. Add or update Playwright coverage in `tests/e2e/` for user-visible golden paths.

5. Implement the UI with existing component and styling patterns.

6. Start the running app.

```bash
bun run dev
```

7. Manually verify the changed route in the browser. Include golden path, empty state, error state, and nearby navigation where applicable.

8. Run focused checks.

```bash
bun run type-check
bun run test:e2e
```

9. Run the full gate before handoff.

```bash
bun run complete-check
```

10. Update docs when route behavior, UI flow, or verification instructions changed.

## Scenario 5: Implement an API contract card

Use this for Tech Lead cards that specify contracts before implementation work.

1. Open the relevant sprint section in [docs/TASK_BREAKDOWN.md](docs/TASK_BREAKDOWN.md).

2. Read the cited acceptance criteria under [docs/business/](docs/business/).

3. Read related module and integration specs under [docs/technical-specs/](docs/technical-specs/).

4. Add or update the matching contract document under [docs/api-specs/](docs/api-specs/).

5. Define request shapes, response shapes, status codes, validation rules, authorization rules, privacy constraints, failure envelopes, and test expectations.

6. Cross-link the API spec to the technical source documents instead of restating long architecture sections.

7. Run documentation index checks if the changed docs affect generated or linked indexes.

```bash
python scripts/check_index.py
```

8. If code changed, run the relevant code checks and then:

```bash
bun run complete-check
```

## Scenario 6: Wire a feature end-to-end

Use this for wiring cards where backend and frontend work must be proven together.

1. Confirm all prerequisite backend and frontend cards are complete or present in the branch.

2. Start the app.

```bash
bun run dev
```

3. Prepare local state.

```bash
bun run db:migrate
bun run db:seed:dev
```

4. Execute the acceptance path in the browser from the user's point of view.

5. Confirm server behavior with route checks where useful.

```bash
curl "$NEXT_PUBLIC_APP_URL/api/health"
```

6. Add or update Playwright coverage for the full path.

7. Verify privacy-sensitive output manually. Public share pages must show only documented public projection fields.

8. Run the full gate.

```bash
bun run complete-check
```

## Scenario 7: Reset local state

Use this when local data needs to return to a known development seed.

1. Confirm `.env.local` is pointed at a disposable local database or safe development database.

2. Confirm reset is enabled only outside production.

```bash
APP_ENV=development
ENABLE_RESET_API=true
RESET_STATE_SECRET=replace-with-local-reset-secret
```

3. Start the app.

```bash
bun run dev
```

4. Call the reset endpoint.

```bash
curl -X POST "$NEXT_PUBLIC_APP_URL/api/admin/reset-state" \
  -H "Authorization: Bearer $RESET_STATE_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"seed":"dev"}'
```

5. Restart the development server.

6. Verify health.

```bash
curl "$NEXT_PUBLIC_APP_URL/api/health"
```

If the reset API is unavailable, use the project migration and seed runners against a disposable local database.

```bash
bun run db:migrate
bun run db:seed:dev
```

Do not use ad hoc destructive SQL against shared or production-like data.

## Scenario 8: Review a PR

Use this when reviewing another contributor's change.

1. Read the PR summary and identify the sprint card or acceptance criteria it claims to satisfy.

2. Read [docs/CODE_REVIEW_CHECKLIST.md](docs/CODE_REVIEW_CHECKLIST.md) and [docs/CODING_STANDARD.md](docs/CODING_STANDARD.md).

3. Confirm the change stays inside the card scope.

4. Check that domain logic is in `lib/`, route handlers are thin, and reusable UI components remain presentation-only.

5. Check security and privacy boundaries:
   - daily.dev tokens are server-only.
   - private user data is owner-scoped.
   - public share snapshots are allowlisted.
   - reset endpoints are absent or unreachable in production.

6. Run or verify the full gate.

```bash
bun run complete-check
```

7. For UI changes, run the app and verify the affected route in a browser.

```bash
bun run dev
```

8. Request changes for correctness, security, privacy, contract drift, missing tests, or broken acceptance criteria.

## Scenario 9: Prepare a release update

Use this when a change is going to `main` and Vercel will deploy it.

1. Read [docs/DEPLOYMENT_PLAN.md](docs/DEPLOYMENT_PLAN.md).

2. Run the full local gate.

```bash
bun run complete-check
```

3. If schema changes are included, create a Neon branch or snapshot before applying migrations.

4. Run migrations against the intended target database only after confirming `DATABASE_URL`.

```bash
bun run db:migrate
```

5. Merge or push to `main` through the project's approved GitHub flow.

6. Confirm Vercel deploys the selected commit.

7. Verify hosted health.

```bash
curl "$NEXT_PUBLIC_APP_URL/api/health"
```

8. Inspect Vercel logs and Neon status for runtime or database errors.

Rollback and database recovery procedures live in [docs/DEPLOYMENT_PLAN.md](docs/DEPLOYMENT_PLAN.md).
