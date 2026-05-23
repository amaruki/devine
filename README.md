# Devine

Devine is a daily.dev-powered virtual rubber duck companion for turning developer reading into a visible habit loop.

## Table of Contents

- [What this project is](#what-this-project-is)
- [Current status](#current-status)
- [Tech stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quickstart](#quickstart)
- [Verification](#verification)
- [Repository map](#repository-map)
- [Key routes](#key-routes)
- [Project docs](#project-docs)

## What this project is

Devine is a hackathon MVP for daily.dev. It pairs a developer's reading and engagement behavior with a rubber duck pet whose energy, health, seniority level, quests, power-ups, and speech bubbles reflect the user's learning habits.

The product promise and scope are defined in [prd.md](prd.md). Sprint work is broken down in [docs/TASK_BREAKDOWN.md](docs/TASK_BREAKDOWN.md), with acceptance criteria under [docs/business/](docs/business/).

## Current status

The repository contains a Bun-run Next.js 16 App Router scaffold plus implementation planning docs. The shipped app surface currently includes scaffold routes for landing, dashboard, settings, auth, health, daily.dev token testing, reset state, and public share snapshots. Several domain modules return placeholder or contract-level behavior while the sprint cards are implemented.

Use the docs as the source of intended MVP behavior. Use the code as the source of what runs today.

## Tech stack

- Bun 1.3.1 for package management and scripts
- Next.js 16 App Router
- React 19
- TypeScript strict mode
- Tailwind CSS 4
- Drizzle ORM with Postgres
- Neon Postgres for hosted database
- Zod for boundary validation
- Bun test for unit tests
- Playwright for E2E tests
- oxlint and oxfmt for linting and formatting
- Vercel for deployment

See [docs/technical-specs/04-tech-stack.md](docs/technical-specs/04-tech-stack.md) for the detailed stack.

## Prerequisites

Install:

- Bun 1.3.1
- A Postgres database, local or Neon
- Git

For deployment work, access to the Vercel project and Neon project is required. Deployment details live in [docs/DEPLOYMENT_PLAN.md](docs/DEPLOYMENT_PLAN.md).

## Quickstart

Install dependencies from the lockfile.

```bash
bun install --frozen-lockfile
```

Create a local environment file from the example.

```bash
cp .env.example .env.local
```

Set values in `.env.local`.

```bash
APP_ENV=development
DATABASE_URL=postgres://user:password@localhost:5432/dailydev
DAILYDEV_TOKEN_ENCRYPTION_KEY=base64-encoded-32-byte-key
SESSION_SECRET=replace-with-local-session-secret
RESET_STATE_SECRET=replace-with-local-reset-secret
ENABLE_RESET_API=true
DEFAULT_SEED=dev
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Generate local secrets with high entropy.

```bash
openssl rand -base64 32
openssl rand -base64 48
```

Run database migrations and seed local development data.

```bash
bun run db:migrate
bun run db:seed:dev
```

Start the development server.

```bash
bun run dev
```

Open the app at `http://localhost:3000`.

Check local health.

```bash
curl "$NEXT_PUBLIC_APP_URL/api/health"
```

On Windows PowerShell, use `$env:NEXT_PUBLIC_APP_URL` if the value is exported in the shell.

## Verification

Run the full merge gate before a PR is considered ready.

```bash
bun run complete-check
```

The full gate expands to:

```bash
bun run type-check
bun run lint
bun run format
bun run test
bun run test:e2e
bun run build
```

CI runs `bun install --frozen-lockfile` and `bun run complete-check` on pull requests and pushes to `main`.

## Repository map

```text
app/                    Next.js App Router pages, server actions, and API routes
app/(marketing)/        Landing page
app/auth/               Login and registration scaffold
app/dashboard/          Dashboard scaffold and actions
app/settings/           Settings scaffold and actions
app/share/[snapshotId]/ Public share snapshot page
app/api/                Health, reset, daily.dev, and share API routes
components/             React components grouped by surface
components/duck/        Duck avatar component
components/ui/          Reusable presentation primitives
docs/                   Product, technical, API, workflow, and deployment docs
lib/                    Domain, integration, persistence, security, and operation modules
lib/db/                 Drizzle client, schema, migrations, and seed runners
scripts/                Repository helper scripts
tests/e2e/              Playwright browser tests
tests/unit/             Bun unit tests
```

The helper script named in the project-docs skill, `scripts/repo_tree.py`, is not present in this repo. This map reflects the observed repository layout.

## Key routes

| Route                           | Purpose                                | Current status                             |
| ------------------------------- | -------------------------------------- | ------------------------------------------ |
| `/`                             | Marketing landing page                 | Implemented scaffold                       |
| `/dashboard`                    | Pet dashboard                          | Stub UI                                    |
| `/settings`                     | daily.dev connection and demo controls | Stub UI                                    |
| `/auth/register`                | Registration                           | Scaffold                                   |
| `/auth/login`                   | Login                                  | Scaffold                                   |
| `/share/[snapshotId]`           | Public share snapshot                  | Scaffold                                   |
| `/api/health`                   | Health contract                        | Implemented static contract                |
| `/api/admin/reset-state`        | Local reset endpoint                   | Scaffolded and environment gated by design |
| `/api/dailydev/test-connection` | daily.dev token validation             | Scaffolded integration route               |
| `/api/share-snapshots`          | Share snapshot creation                | Scaffolded contract                        |

## Project docs

Start here:

- [docs/ONBOARDING_GUIDE.md](docs/ONBOARDING_GUIDE.md) for setup and first-change orientation
- [docs/DEVELOPMENT_SCENARIO_GUIDE.md](docs/DEVELOPMENT_SCENARIO_GUIDE.md) for recurring development workflows
- [docs/GLOSSARY.md](docs/GLOSSARY.md) for domain vocabulary
- [docs/CODING_STANDARD.md](docs/CODING_STANDARD.md) for code and review standards
- [docs/TASK_BREAKDOWN.md](docs/TASK_BREAKDOWN.md) for sprint cards
- [docs/DEPLOYMENT_PLAN.md](docs/DEPLOYMENT_PLAN.md) for Vercel and Neon operations
- [docs/api-specs/](docs/api-specs/) for route and action contracts
- [docs/technical-specs/](docs/technical-specs/) for architecture and module details
