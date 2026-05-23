# Devine Deployment Plan

**Version:** 0.1.0  
**Date:** 2026-05-23  
**Author:** Claude Code  
**Status:** Approved runbook

## Table of Contents

1. [Summary](#summary)
2. [Environments](#environments)
3. [Infrastructure Overview](#infrastructure-overview)
4. [Initial Deployment](#initial-deployment)
5. [Updating to a New Release](#updating-to-a-new-release)
6. [Rollback](#rollback)
7. [Database State Reset](#database-state-reset)
8. [Inspecting and Debugging the Database](#inspecting-and-debugging-the-database)

## Summary

Devine is a Next.js 16 App Router application deployed to Vercel and backed by Neon Postgres. The local environment uses Bun for development, database migration, and seeding. The Vercel environment deploys automatically when `main` is updated.

The deployment model has two environments only: local and Vercel. Vercel is production-like. The reset API is enabled only for local development and must be disabled in Vercel.

## Environments

| Environment | URL or host                                             | Purpose                                    | Who deploys                             |
| ----------- | ------------------------------------------------------- | ------------------------------------------ | --------------------------------------- |
| Local       | `NEXT_PUBLIC_APP_URL`, normally `http://localhost:3000` | Development, local QA, reset-state testing | Any developer                           |
| Vercel      | `NEXT_PUBLIC_APP_URL` from Vercel project settings      | Hosted production-like app                 | Project owner through updates to `main` |

## Infrastructure Overview

| Component              | Technology            | Location                       | Notes                                                               |
| ---------------------- | --------------------- | ------------------------------ | ------------------------------------------------------------------- |
| Web app                | Next.js 16 App Router | Local Bun dev server or Vercel | Single deployable application                                       |
| Package runner         | Bun 1.3.1             | Local and CI                   | Scripts are defined in `package.json`                               |
| Database               | Neon Postgres         | Neon managed service           | Reached through `DATABASE_URL`                                      |
| CI                     | GitHub Actions        | GitHub                         | Runs `bun run complete-check` on pull requests and pushes to `main` |
| Reverse proxy and TLS  | Vercel                | Vercel                         | No Nginx or host-level TLS setup                                    |
| Registry or containers | None                  | Not applicable                 | The MVP does not ship Docker images                                 |

Topology:

```mermaid
graph LR
  Developer[Developer workstation]
  GitHub[GitHub repository]
  Vercel[Vercel project]
  Neon[Neon Postgres]
  DailyDev[daily.dev API]

  Developer --> GitHub
  GitHub --> Vercel
  Developer --> Neon
  Vercel --> Neon
  Vercel --> DailyDev
```

The app and database are separate managed services. Database commands run from an operator workstation with `DATABASE_URL` set to the target Neon database. There is no app VM or DB VM.

## Initial Deployment

### 1. Prerequisites

Install the project toolchain on the operator workstation.

```bash
# Verify Bun is available.
bun --version

# Install dependencies from the lockfile.
bun install --frozen-lockfile

# Run the full local quality gate before deploying.
bun run complete-check
```

### 2. Configure local environment variables

Create `.env.local` or export the same names in the shell. Do not commit `.env.local`.

```bash
# App mode for local development.
APP_ENV=development

# Local Postgres or Neon development database.
DATABASE_URL=postgres://user:password@localhost:5432/dailydev

# Generate with: openssl rand -base64 32
DAILYDEV_TOKEN_ENCRYPTION_KEY=base64-encoded-32-byte-key

# Generate with: openssl rand -base64 48
SESSION_SECRET=replace-with-local-session-secret

# Local reset API only.
RESET_STATE_SECRET=replace-with-local-reset-secret
ENABLE_RESET_API=true
DEFAULT_SEED=dev

# Public base URL used for share links and health checks.
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Generate local secrets with high entropy.

```bash
# Generates a base64-encoded 32-byte AES-GCM key.
openssl rand -base64 32

# Generates a high-entropy session secret.
openssl rand -base64 48

# Generates a local reset secret if ENABLE_RESET_API=true.
openssl rand -base64 48
```

### 3. Configure Vercel environment variables

Set Vercel project environment variables in the Vercel dashboard. Use the same names as `.env.example`.

| Variable                        | Vercel value                 | Required | Notes                                       |
| ------------------------------- | ---------------------------- | -------- | ------------------------------------------- |
| `APP_ENV`                       | `production`                 | Yes      | Vercel is production-like                   |
| `DATABASE_URL`                  | Neon production database URL | Yes      | Used by Drizzle client and migration runner |
| `DAILYDEV_TOKEN_ENCRYPTION_KEY` | Base64-encoded 32-byte key   | Yes      | Never rotate without a token migration plan |
| `SESSION_SECRET`                | High-entropy random string   | Yes      | Signs session cookies                       |
| `RESET_STATE_SECRET`            | Not set                      | No       | Local only                                  |
| `ENABLE_RESET_API`              | Not set or `false`           | Yes      | Must not be enabled in Vercel               |
| `DEFAULT_SEED`                  | Not set                      | No       | Local reset helper only                     |
| `DAILYDEV_SERVER_TOKEN`         | Optional server token        | No       | Never expose client-side                    |
| `NEXT_PUBLIC_APP_URL`           | Canonical Vercel app URL     | Yes      | Public, not secret                          |

### 4. Prepare the Neon database

Create or select the Neon database used by Vercel and copy its connection string into `DATABASE_URL` in the Vercel project settings.

Before destructive or schema-changing database work, create a Neon branch or snapshot in the Neon dashboard.

### 5. Run migrations

Run migrations from a local checkout with `DATABASE_URL` set to the target database. The migration runner resolves its own migration folder and reads the connection string from the environment.

```bash
# Runs Drizzle migrations from lib/db/migrate.ts using DATABASE_URL.
bun run db:migrate
```

### 6. Seed local development data

Only local development uses routine seeding.

```bash
# Seeds local development data through the project seed runner.
bun run db:seed:dev
```

Do not routinely seed Vercel. Hosted data must not be overwritten during normal deploys.

### 7. Start local app

```bash
# Starts the local Next.js development server.
bun run dev
```

Verify local health.

```bash
# Confirms the app responds without exposing secrets.
curl "$NEXT_PUBLIC_APP_URL/api/health"
```

### 8. Deploy to Vercel

Vercel deploys automatically when `main` is updated. The primary deploy path is GitHub plus Vercel dashboard, not Vercel CLI.

```bash
# Verify the branch before merging or pushing.
git status

# Push the commit that updates main.
git push origin main
```

After the push, open the Vercel dashboard and confirm the deployment for `main` completes successfully.

### 9. Verify Vercel deployment

```bash
# Verifies the deployed health endpoint.
curl "$NEXT_PUBLIC_APP_URL/api/health"
```

Also verify:

1. Vercel deployment status is successful.
2. Vercel deployment logs show no startup, build, or runtime errors.
3. Neon dashboard shows the database is available.

## Updating to a New Release

### Standard update without schema changes

1. Run the full check locally.

```bash
# Runs type check, lint, formatting, unit tests, E2E tests, and build.
bun run complete-check
```

2. Merge or push to `main`.

```bash
# Pushes main and lets Vercel auto-deploy.
git push origin main
```

3. Verify the deployment.

```bash
# Confirms the deployed app is healthy.
curl "$NEXT_PUBLIC_APP_URL/api/health"
```

4. Inspect Vercel deployment logs and Neon status.

### Update with schema changes

1. Create a Neon branch or snapshot before applying schema changes.

2. Set `DATABASE_URL` locally to the Vercel Neon database.

```bash
# Confirms the migration command can reach the intended database.
bun run db:migrate
```

3. Only after migrations succeed, merge or push the app change to `main`.

```bash
# Triggers the Vercel deployment from main.
git push origin main
```

4. Verify the deployment and database status.

```bash
# Confirms the app is healthy against the migrated database.
curl "$NEXT_PUBLIC_APP_URL/api/health"
```

This migration flow is manual and not atomic with Vercel automatic deployment. The operator must coordinate migration timing and application deployment. Contact the project owner before applying destructive schema changes.

### Pinning to a specific version

This project does not use container image tags or a package registry artifact. The deployed version is the Git commit selected by Vercel for the `main` deployment.

To pin or revert the running version, use the Vercel deployment history and promote or redeploy a specific deployment.

### Troubleshooting a failed update

| Symptom                                   | Check                               | Recovery                                                                          |
| ----------------------------------------- | ----------------------------------- | --------------------------------------------------------------------------------- |
| Build fails in Vercel                     | Vercel build logs                   | Reproduce locally with `bun run complete-check`, fix, and push again              |
| Runtime errors after deploy               | Vercel function logs                | Check missing env vars and recent schema changes                                  |
| Health endpoint reports degraded database | Neon dashboard and `DATABASE_URL`   | Verify database availability and the Vercel `DATABASE_URL` value                  |
| Migration fails locally                   | Migration output and Neon dashboard | Stop the deploy, keep the Neon branch or snapshot, and contact the project owner  |
| App deployed before required migration    | Vercel logs and health endpoint     | Run `bun run db:migrate`, then redeploy or promote the fixed deployment if needed |

## Rollback

Use Vercel Dashboard → Deployments → select the last known-good deployment → Promote to Production or Redeploy.

Database changes are forward-only unless manually coordinated. A Vercel rollback does not undo migrations, data writes, or destructive database changes. Contact the project owner before rolling back across a schema change.

## Database State Reset

### Environment gating

| Environment | Reset allowed? | Seed used | Mechanism                              |
| ----------- | -------------- | --------- | -------------------------------------- |
| Local       | Yes            | `dev`     | `POST /admin/reset-state` when enabled |
| Vercel      | No             | None      | Reset API must be disabled             |

**Production data must never be reset.** Vercel is production-like for this project. `ENABLE_RESET_API` must be absent or `false`, and `RESET_STATE_SECRET` must not be set in Vercel.

### What initial state means

Initial state means the database schema is at the latest migration and the selected seed dataset has been applied. For this project, local reset uses the `dev` seed. Vercel has no routine reset or seed flow.

### Local reset procedure

The local reset API is available only when:

1. `APP_ENV` is not `production`.
2. `ENABLE_RESET_API=true`.
3. `RESET_STATE_SECRET` is set.
4. The app is running locally.

```bash
# Calls the guarded local reset endpoint with the dev seed.
curl -X POST "$NEXT_PUBLIC_APP_URL/api/admin/reset-state" \
  -H "Authorization: Bearer $RESET_STATE_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"seed":"dev"}'
```

After reset, restart the local development server so any stale server state is cleared.

```bash
# Stop the current dev server with Ctrl-C, then start it again.
bun run dev
```

Verify local health and expected local seed data.

```bash
# Confirms the local app responds after reset.
curl "$NEXT_PUBLIC_APP_URL/api/health"
```

### Manual reset fallback

Do not use ad hoc raw SQL, arbitrary file paths, or hardcoded migration file paths for reset. If the reset API is unavailable, the safe fallback is to fix the reset implementation or use the project migration and seed runners against a disposable local database.

Destructive local database work deletes local data. Create a Neon branch or snapshot first if the local environment points at Neon.

```bash
# Re-applies project migrations through the stable runner.
bun run db:migrate

# Re-applies local dev seed data through the stable runner.
bun run db:seed:dev
```

### Seed selection

| Seed  | Command               | Environment                          | Notes                           |
| ----- | --------------------- | ------------------------------------ | ------------------------------- |
| `dev` | `bun run db:seed:dev` | Local                                | Development seed data           |
| `qa`  | `bun run db:seed:qa`  | Not used in current deployment model | Reserved by the project scripts |

Seeds must remain version-controlled and idempotent. The reset API accepts only `dev` or `qa` and never accepts arbitrary file paths.

## Inspecting and Debugging the Database

### Check application health

```bash
# Reports app health and database dependency status.
curl "$NEXT_PUBLIC_APP_URL/api/health"
```

### Inspect Vercel logs

Use Vercel Dashboard → Project → Deployments → selected deployment → Logs.

Look for:

1. Missing environment variables.
2. Database connection failures.
3. Migration mismatch symptoms.
4. daily.dev API failures.

### Inspect Neon status

Use the Neon dashboard for:

1. Database availability.
2. Connection string verification.
3. Branch or snapshot creation before risky changes.
4. Query console access for read-only inspection.
5. Backup or restore operations.

### Run one-off migration inspection

Use the project migration runner only. Do not pipe raw SQL migration files manually.

```bash
# Runs pending migrations against DATABASE_URL.
bun run db:migrate
```

### Dump and restore

Prefer Neon branch, snapshot, backup, and restore features from the Neon dashboard. Before any destructive action, create a Neon branch or snapshot and confirm the target database is the intended database.

### Reset reference

For local reset, use the [Database State Reset](#database-state-reset) procedure. Vercel reset is forbidden in the current deployment model.
