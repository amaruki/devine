# Devine Onboarding Guide

Devine is a daily.dev reading companion that turns developer learning activity into a rubber duck habit loop.

## Table of Contents

- [Project context](#project-context)
- [Current repository state](#current-repository-state)
- [Prerequisites](#prerequisites)
- [Local setup](#local-setup)
- [Environment variables](#environment-variables)
- [Codebase walkthrough](#codebase-walkthrough)
- [What to read first](#what-to-read-first)
- [Development workflow](#development-workflow)
- [Core concepts](#core-concepts)
- [Where to get help](#where-to-get-help)

## Project context

Devine is a hackathon MVP for daily.dev. It helps developers turn daily.dev reading, curation, and discussion into a visible learning habit through a virtual rubber duck with energy, health, seniority levels, quests, power-ups, and shareable snapshots.

The product direction is in [prd.md](prd.md). The implementation roadmap is in [docs/TASK_BREAKDOWN.md](docs/TASK_BREAKDOWN.md).

## Current repository state

This repo is an implemented scaffold with a complete documentation and planning base. It has runnable Next.js routes, core module boundaries, tests, CI, and toolchain configuration, but many product modules still expose placeholder or contract-level behavior while sprint cards are built.

Treat source code as the truth for current behavior. Treat [docs/technical-specs/](docs/technical-specs/) and [docs/api-specs/](docs/api-specs/) as the truth for intended MVP contracts.

## Prerequisites

Install these before starting:

- Bun 1.3.1
- Git
- A Postgres database, local or Neon
- A browser supported by Playwright

For hosted deployment or production-like debugging, you also need access to the Vercel and Neon projects.

## Local setup

Install dependencies.

```bash
bun install --frozen-lockfile
```

Create a local environment file.

```bash
cp .env.example .env.local
```

Edit `.env.local` with local values. Use a disposable local database or a Neon development branch.

Run migrations and seed data.

```bash
bun run db:migrate
bun run db:seed:dev
```

Start the app.

```bash
bun run dev
```

Open `http://localhost:3000`.

Verify health.

```bash
curl "$NEXT_PUBLIC_APP_URL/api/health"
```

Run the full verification gate before handing work off.

```bash
bun run complete-check
```

## Environment variables

The local variable list is defined in [.env.example](.env.example). Configuration behavior is documented in [docs/technical-specs/11-environment-configuration.md](docs/technical-specs/11-environment-configuration.md).

| Variable                        | Local purpose                                             |
| ------------------------------- | --------------------------------------------------------- |
| `APP_ENV`                       | Selects development or production-like behavior           |
| `DATABASE_URL`                  | Postgres connection string                                |
| `DAILYDEV_TOKEN_ENCRYPTION_KEY` | Base64-encoded 32-byte key for encrypted daily.dev tokens |
| `SESSION_SECRET`                | Secret for session signing                                |
| `RESET_STATE_SECRET`            | Bearer secret for the local reset API                     |
| `ENABLE_RESET_API`              | Enables local reset behavior when true                    |
| `DEFAULT_SEED`                  | Selects the default local seed                            |
| `NEXT_PUBLIC_APP_URL`           | Public base URL for local links and health checks         |

Generate local secrets with:

```bash
openssl rand -base64 32
openssl rand -base64 48
```

Do not commit `.env.local` or real secrets.

## Codebase walkthrough

```text
app/                    Next.js App Router entry points
app/(marketing)/        Landing page at `/`
app/auth/               Login and registration screens plus auth actions
app/dashboard/          Dashboard page and server actions
app/settings/           Settings page and server actions
app/share/[snapshotId]/ Public share snapshot page
app/api/                Route handlers for health, reset, daily.dev, and share APIs
components/             UI and duck components
components/duck/        Duck avatar presentation
components/ui/          Reusable presentation primitives
docs/business/          Requirements, user stories, and acceptance criteria
docs/api-specs/         API and server-action contracts
docs/technical-specs/   Architecture, modules, data model, security, and integration specs
lib/                    Domain and service modules
lib/activity/           Activity normalization boundary
lib/auth/               Auth contracts and scaffold behavior
lib/dailydev/           daily.dev client and DTO types
lib/db/                 Drizzle client, schema, migrations, and seed scripts
lib/demo/               Demo mode boundary
lib/operations/         Health and reset operations
lib/powerups/           Power-up engine boundary
lib/quests/             Quest engine boundary
lib/scoring/            Scoring types and scoring engine boundary
lib/security/           Security helper boundary
lib/share/              Share snapshot contracts
lib/speech/             Speech bubble boundary
lib/users/              User domain boundary
tests/unit/             Bun unit tests
tests/e2e/              Playwright tests
```

## What to read first

1. [README.md](README.md) for project commands and structure.
2. [GLOSSARY.md](GLOSSARY.md) for product vocabulary.
3. [prd.md](prd.md) for product goals and MVP scope.
4. [docs/CODING_STANDARD.md](docs/CODING_STANDARD.md) for coding rules and merge gates.
5. [docs/TASK_BREAKDOWN.md](docs/TASK_BREAKDOWN.md) for sprint cards and ownership model.
6. [docs/technical-specs/\_index.md](docs/technical-specs/_index.md) for architecture docs.
7. [docs/api-specs/\_index.md](docs/api-specs/_index.md) for API contracts.
8. [docs/DEPLOYMENT_PLAN.md](docs/DEPLOYMENT_PLAN.md) before touching deploy or database operations.

## Development workflow

Work starts from a sprint card in [docs/TASK_BREAKDOWN.md](docs/TASK_BREAKDOWN.md). Each card cites acceptance criteria and source docs. Use those references to understand the expected behavior before editing code.

For recurring task flows, follow [DEVELOPMENT_SCENARIO_GUIDE.md](DEVELOPMENT_SCENARIO_GUIDE.md). The short version is:

1. Pick a card and read every linked source doc.
2. Identify the current scaffold or module boundary.
3. Add or update tests for the acceptance-criterion paths.
4. Implement the smallest change that satisfies the card.
5. Run focused checks while working.
6. Run `bun run complete-check` before handoff.
7. Update docs when route contracts, architecture, environment variables, or verification commands change.

## Core concepts

Internalize these before making feature changes:

- Devine is requirement-driven. Tie work back to acceptance criteria.
- Demo mode must remain reliable without daily.dev credentials.
- daily.dev token handling is server-only and privacy-sensitive.
- Public share pages expose only allowlisted aggregate fields.
- Domain logic belongs in `lib/`, not React pages or route handlers.
- Route handlers and server actions validate, authorize, call services, and map responses.
- Power-ups affect energy and health, never seniority directly.
- The MVP avoids background workers, queues, Redis, full AI chat, leaderboards, browser extensions, and image export.

See [GLOSSARY.md](GLOSSARY.md) for term definitions.

## Where to get help

Ask the project owner for access, prioritization, deployment, or unclear product-scope decisions.

For code rules, start with [docs/CODING_STANDARD.md](docs/CODING_STANDARD.md). For deployment and database operations, use [docs/DEPLOYMENT_PLAN.md](docs/DEPLOYMENT_PLAN.md).
