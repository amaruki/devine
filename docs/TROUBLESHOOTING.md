# Devine Troubleshooting Guide

**Version:** 0.1.0  
**Date:** 2026-05-23  
**Author:** Claude Code  
**Status:** Living skeleton, architecture-seeded

This guide is symptom-indexed. Start with what the operator sees, then confirm the failing seam. Entries are scaffolded from the current architecture and deployment docs, not from a real incident corpus yet. Promote an entry to confirmed only after an actual incident verifies it.

## Fast triage checklist

1. Confirm the app responds.

```bash
curl "$NEXT_PUBLIC_APP_URL/api/health"
```

2. Check whether a deploy just happened in Vercel Dashboard → Project → Deployments.
3. Inspect Vercel deployment and function logs for build, startup, runtime, and missing environment variable errors.
4. Check Neon dashboard for database availability and the target branch or connection string.
5. If the symptom followed a schema change, use the migration and rollback guidance in [DEPLOYMENT_PLAN.md](DEPLOYMENT_PLAN.md#updating-to-a-new-release) and [DEPLOYMENT_PLAN.md](DEPLOYMENT_PLAN.md#rollback).
6. If daily.dev connection testing fails, isolate whether the app route rejects the request or the external daily.dev API rejects the token.

## Database and persistence

### App logs show `DATABASE_URL is required`

**Looks like:** Vercel runtime logs or local server output include `DATABASE_URL is required`.
**Likely causes:**

1. `DATABASE_URL` is missing from `.env.local` or Vercel environment variables.
2. The variable was added in Vercel but the deployment was not redeployed.
3. The app is running in a shell that did not load `.env.local`.

**Confirm:**

```bash
bun run db:migrate
```

If the app is deployed, check Vercel Dashboard → Project → Settings → Environment Variables for `DATABASE_URL`, then check the active deployment logs.

**Fix:**

1. Set `DATABASE_URL` to the intended local Postgres or Neon connection string.
2. For Vercel, redeploy after changing environment variables.
3. Re-run the migration runner before deploying schema-dependent app changes.

**Prevent:** Keep `.env.example` aligned with required runtime variables and run `bun run complete-check` before pushing to `main`.
**Status:** scaffolded · not yet seen in production

### Migration fails before or during a release

**Looks like:** `bun run db:migrate` exits non-zero, or Vercel logs show runtime errors immediately after a schema-dependent deploy.
**Likely causes:**

1. `DATABASE_URL` points at the wrong Neon database or branch.
2. Neon is unavailable or rejecting the connection.
3. The migration is incompatible with existing data.
4. The app deployed before the required migration completed.

**Confirm:**

```bash
bun run db:migrate
```

Also verify the target database and branch in the Neon dashboard.

**Fix:** Follow [DEPLOYMENT_PLAN.md](DEPLOYMENT_PLAN.md#update-with-schema-changes). Stop the release if migration fails. Keep the Neon branch or snapshot and contact the project owner before destructive schema changes.
**Prevent:** Create a Neon branch or snapshot before schema-changing work and migrate before pushing schema-dependent app code to `main`.
**Status:** scaffolded · not yet seen in production

### Local seed or reset data does not appear

**Looks like:** Local dashboard, settings, or share surfaces show missing or unexpected data after `bun run db:seed:dev` or a reset request.
**Likely causes:**

1. The app is connected to a different database than the seed runner.
2. The local dev server has stale state after a reset.
3. The reset route currently returns a scaffolded success response and does not apply database changes.
4. The selected seed is not the expected dataset.

**Confirm:**

```bash
bun run db:migrate
bun run db:seed:dev
curl "$NEXT_PUBLIC_APP_URL/api/health"
```

For reset route behavior:

```bash
curl -X POST "$NEXT_PUBLIC_APP_URL/api/admin/reset-state" \
  -H "Authorization: Bearer $RESET_STATE_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"seed":"dev"}'
```

**Fix:** Use the project migration and seed runners against a disposable local database. Restart the local dev server after reset. Do not use ad hoc raw SQL or arbitrary migration file paths. See [DEPLOYMENT_PLAN.md](DEPLOYMENT_PLAN.md#database-state-reset).
**Prevent:** Keep local `DATABASE_URL` explicit and avoid pointing reset or seed workflows at production-like Neon data.
**Status:** scaffolded · not yet seen in production

## Vercel runtime, reverse proxy, and TLS

### Deployed app returns 404, 500, or Vercel error page

**Looks like:** Browser shows a Vercel error page, a route returns 404 unexpectedly, or `curl "$NEXT_PUBLIC_APP_URL/api/health"` does not return JSON.
**Likely causes:**

1. The latest Vercel deployment failed or was not promoted.
2. `NEXT_PUBLIC_APP_URL` points to the wrong deployment or domain.
3. A runtime environment variable is missing.
4. The route path is wrong. Health is exposed at `/api/health`.

**Confirm:**

```bash
curl "$NEXT_PUBLIC_APP_URL/api/health"
```

Check Vercel Dashboard → Project → Deployments → selected deployment → Logs.

**Fix:** Promote or redeploy the last known-good deployment if the latest deployment is broken. Fix missing environment variables and redeploy. Use Vercel deployment history for rollback, as documented in [DEPLOYMENT_PLAN.md](DEPLOYMENT_PLAN.md#rollback).
**Prevent:** Run `bun run complete-check` before pushing to `main` and verify Vercel deployment logs after each release.
**Status:** scaffolded · not yet seen in production

### Share links resolve to the wrong host

**Looks like:** Public share links use localhost, an old preview URL, or a non-canonical domain.
**Likely causes:**

1. `NEXT_PUBLIC_APP_URL` is incorrect in Vercel environment variables.
2. Local `.env.local` values were copied into Vercel.
3. The deployment was not redeployed after changing the public base URL.

**Confirm:**

```bash
curl "$NEXT_PUBLIC_APP_URL/api/health"
```

Check Vercel Dashboard → Project → Settings → Environment Variables for `NEXT_PUBLIC_APP_URL`.

**Fix:** Set `NEXT_PUBLIC_APP_URL` to the canonical Vercel app URL and redeploy.
**Prevent:** Treat `NEXT_PUBLIC_APP_URL` as environment-specific configuration during deployment review.
**Status:** scaffolded · not yet seen in production

## Build and CI

### GitHub Actions fails during dependency installation

**Looks like:** CI job `complete-check` fails at `bun install --frozen-lockfile`.
**Likely causes:**

1. `package.json` and `bun.lock` are out of sync.
2. The CI Bun version differs from the expected version.
3. A dependency resolution issue was introduced locally without updating the lockfile.

**Confirm:**

```bash
bun --version
bun install --frozen-lockfile
```

CI uses Bun `1.3.1` from `.github/workflows/ci.yml`.

**Fix:** Regenerate the lockfile with the project Bun version, then rerun `bun install --frozen-lockfile` and `bun run complete-check` locally.
**Prevent:** Use Bun `1.3.1` for package changes and commit `bun.lock` with dependency updates.
**Status:** scaffolded · not yet seen in production

### CI or Vercel build fails after a code change

**Looks like:** GitHub Actions or Vercel build logs fail in type check, lint, format, tests, E2E, or Next build.
**Likely causes:**

1. TypeScript strict-mode errors.
2. oxlint or oxfmt violations.
3. Unit or Playwright E2E regressions.
4. Next.js build failure from server/client boundary mistakes or missing runtime variables.

**Confirm:**

```bash
bun run complete-check
```

The gate expands to:

```bash
bun run type-check
bun run lint
bun run format
bun run test
bun run test:e2e
bun run build
```

**Fix:** Reproduce locally with the failing script, fix the first failing stage, then rerun `bun run complete-check` before pushing again.
**Prevent:** Run the full gate before PRs and before updating `main`.
**Status:** scaffolded · not yet seen in production

## daily.dev integration

### daily.dev connection test returns `Invalid request body`

**Looks like:** `POST /api/dailydev/test-connection` returns status 400 with `{ "status": "error", "message": "Invalid request body" }`.
**Likely causes:**

1. Request body is not JSON.
2. Request body does not include a non-empty `token` string.
3. `Content-Type: application/json` is missing from manual requests.

**Confirm:**

```bash
curl -X POST "$NEXT_PUBLIC_APP_URL/api/dailydev/test-connection" \
  -H "Content-Type: application/json" \
  -d '{"token":"replace-with-token"}'
```

**Fix:** Send a JSON body with a non-empty `token` value.
**Prevent:** Keep client-side forms and tests aligned with the API contract in `app/api/dailydev/test-connection/route.ts`.
**Status:** scaffolded · not yet seen in production

### daily.dev connection test fails after accepting the request body

**Looks like:** `POST /api/dailydev/test-connection` passes local validation but the route errors or returns a failed external validation result.
**Likely causes:**

1. The daily.dev token is invalid or expired.
2. daily.dev API is unavailable or rate limited.
3. Network access from Vercel to daily.dev is failing.
4. Integration mapping no longer matches the daily.dev API response.

**Confirm:**

```bash
curl -X POST "$NEXT_PUBLIC_APP_URL/api/dailydev/test-connection" \
  -H "Content-Type: application/json" \
  -d '{"token":"replace-with-token"}'
```

Check Vercel function logs for external API errors after the request.

**Fix:** Retry with a known-valid token. If the same token succeeds locally but fails in Vercel, inspect Vercel function logs and daily.dev availability. If the response shape changed, update the integration mapping and tests.
**Prevent:** Keep daily.dev integration failures isolated to connection testing and avoid exposing tokens client-side beyond the intended test request.
**Status:** scaffolded · not yet seen in production

## Auth, sessions, and token security

### Login or session-protected routes fail immediately in a deployed environment

**Looks like:** Auth routes or session-protected flows return errors, redirect unexpectedly, or Vercel logs mention missing session configuration.
**Likely causes:**

1. `SESSION_SECRET` is missing or changed unexpectedly.
2. `APP_ENV` is not set correctly for the target environment.
3. Session cookie behavior differs between local HTTP and Vercel HTTPS.

**Confirm:**

```bash
curl "$NEXT_PUBLIC_APP_URL/api/health"
```

Then inspect Vercel function logs around the auth request.

**Fix:** Set a high-entropy `SESSION_SECRET` in the target environment and redeploy. Do not rotate the secret casually because existing sessions may become invalid.
**Prevent:** Generate `SESSION_SECRET` with `openssl rand -base64 48` and track environment variable changes during deploy review.
**Status:** scaffolded · not yet seen in production

### Saved daily.dev token cannot be decrypted or reused

**Looks like:** Connected-mode features fail after a user previously saved a daily.dev token, or logs mention token encryption or decryption errors.
**Likely causes:**

1. `DAILYDEV_TOKEN_ENCRYPTION_KEY` is missing.
2. `DAILYDEV_TOKEN_ENCRYPTION_KEY` is not a base64-encoded 32-byte key.
3. The encryption key was rotated without a token migration plan.

**Confirm:**

```bash
curl "$NEXT_PUBLIC_APP_URL/api/health"
```

Check Vercel environment variables and function logs for token security errors.

**Fix:** Restore the original encryption key if tokens were already stored. If the key must rotate, plan a token migration or require users to reconnect.
**Prevent:** Generate the key with `openssl rand -base64 32` and never rotate it without a token migration plan.
**Status:** scaffolded · not yet seen in production

## Local operations endpoints

### Reset endpoint returns 404

**Looks like:** `POST /api/admin/reset-state` returns `{ "status": "not_found" }` with HTTP 404.
**Likely causes:**

1. `ENABLE_RESET_API` is not set to `true`.
2. `APP_ENV=production`, which disables reset.
3. The request is hitting Vercel, where reset must remain disabled.

**Confirm:**

```bash
curl -X POST "$NEXT_PUBLIC_APP_URL/api/admin/reset-state" \
  -H "Authorization: Bearer $RESET_STATE_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"seed":"dev"}'
```

**Fix:** For local only, set `APP_ENV=development`, `ENABLE_RESET_API=true`, and `RESET_STATE_SECRET`, then restart `bun run dev`. Do not enable reset in Vercel.
**Prevent:** Keep reset variables local-only and verify Vercel has `ENABLE_RESET_API` absent or `false`.
**Status:** scaffolded · not yet seen in production

### Reset endpoint returns 401

**Looks like:** `POST /api/admin/reset-state` returns `{ "status": "unauthorized" }` with HTTP 401.
**Likely causes:**

1. `RESET_STATE_SECRET` is missing in the app process.
2. The `Authorization` header is missing.
3. The bearer token does not match `RESET_STATE_SECRET`.

**Confirm:**

```bash
curl -X POST "$NEXT_PUBLIC_APP_URL/api/admin/reset-state" \
  -H "Authorization: Bearer $RESET_STATE_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"seed":"dev"}'
```

**Fix:** Set `RESET_STATE_SECRET` locally, restart the dev server, and send `Authorization: Bearer $RESET_STATE_SECRET`.
**Prevent:** Keep `.env.local` synchronized with `.env.example` for local operations.
**Status:** scaffolded · not yet seen in production

### Reset endpoint returns 400

**Looks like:** `POST /api/admin/reset-state` returns `{ "status": "error", "message": "Invalid request body" }` with HTTP 400.
**Likely causes:**

1. Request body is not JSON.
2. `seed` is missing.
3. `seed` is not `dev` or `qa`.

**Confirm:**

```bash
curl -X POST "$NEXT_PUBLIC_APP_URL/api/admin/reset-state" \
  -H "Authorization: Bearer $RESET_STATE_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"seed":"dev"}'
```

**Fix:** Send JSON with `seed` set to `dev` for normal local resets. `qa` is reserved by project scripts and not used in the current deployment model.
**Prevent:** Keep reset clients constrained to the documented seed enum.
**Status:** scaffolded · not yet seen in production

## Adding an entry

When a real incident is diagnosed, capture it here. If it matches a scaffolded symptom, change the status to confirmed and add the incident date and reference. If it is new, add a symptom-indexed entry with the same fields: looks like, likely causes, confirm, fix, prevent, and status. Keep confirmed entries intact when adding new scaffolded guidance.
