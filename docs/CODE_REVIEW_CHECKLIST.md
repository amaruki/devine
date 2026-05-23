# Code Review Checklist

Use this checklist for every PR. CI-covered items are marked **(CI)** so manual review can focus on behavior, architecture, safety, and contract correctness.

## Scope and Contracts

- [ ] The PR is scoped to one coherent change and does not include unrelated refactors or speculative abstractions. See `CODING_STANDARD.md` §4.2.
- [ ] Public API responses, server action results, and domain results use explicit discriminated shapes. See `CODING_STANDARD.md` §1.3 and §5.4.
- [ ] Any changed route contract, environment variable, security rule, or architecture decision updates the matching docs. See `CODING_STANDARD.md` §11.2.
- [ ] Scaffold behavior is explicit as `not_implemented` or clear placeholder UI, not a fake success path. See `CODING_STANDARD.md` §10.3.

## Architecture and Layering

- [ ] Domain rules live in `lib/<module>/` and do not import React, pages, routes, or components. See `CODING_STANDARD.md` §3.1.
- [ ] Route handlers and server actions only validate, authorize, call services, and map results. See `CODING_STANDARD.md` §3.2.
- [ ] Database access stays behind `lib/db/` repositories or database modules. See `CODING_STANDARD.md` §3.3.
- [ ] UI primitives under `components/ui/` remain presentation-only. See `CODING_STANDARD.md` §3.4.
- [ ] Cross-feature imports use public module entry points, not private implementation files. See `CODING_STANDARD.md` §3.5.
- [ ] Files stay under 300 lines, and files near 250 lines are split by cohesive responsibility. See `CODING_STANDARD.md` §4.1.

## Type Safety and Naming

- [ ] **(CI)** TypeScript strict mode passes with `bun run type-check`. See `CODING_STANDARD.md` §1.1.
- [ ] New code contains no `any`, unchecked `as`, or non-null assertions. See `CODING_STANDARD.md` §1.1.
- [ ] Exported non-component functions declare explicit return types. See `CODING_STANDARD.md` §1.2.
- [ ] Zod schemas are the source of truth for boundary request types where practical. See `CODING_STANDARD.md` §1.4.
- [ ] Files, folders, components, types, functions, variables, Drizzle objects, and database names follow project naming rules. See `CODING_STANDARD.md` §2.1 through §2.4.

## Correctness, Errors, and Transactions

- [ ] Expected validation, auth, user-facing, and integration failures return result unions instead of raw throws. See `CODING_STANDARD.md` §5.1.
- [ ] Throws are limited to impossible invariants and missing required server configuration. See `CODING_STANDARD.md` §5.2.
- [ ] Boundary code maps failures to stable responses and does not expose raw exception details. See `CODING_STANDARD.md` §5.3.
- [ ] Multi-step writes that must be atomic happen inside one repository or service transaction. See `CODING_STANDARD.md` §6.1.
- [ ] daily.dev failures degrade connected mode without breaking demo mode or stored share pages. See `CODING_STANDARD.md` §6.2.
- [ ] The PR does not add queues, caches, or workers for MVP paths without a documented requirement change. See `CODING_STANDARD.md` §6.3.

## Security, Privacy, and Configuration

- [ ] New environment access goes through one server-only validated config module, not scattered `process.env` reads. See `CODING_STANDARD.md` §9.1.
- [ ] Secrets never appear in client props, public JSON, logs, share snapshots, tests, or committed files. See `CODING_STANDARD.md` §9.2.
- [ ] External input is validated with Zod at request, form, reset, token-test, share, and external API boundaries. See `CODING_STANDARD.md` §9.3.
- [ ] Private mutations use the authenticated user ID, and superadmin operations require a superadmin context. See `CODING_STANDARD.md` §9.4.
- [ ] Public share snapshots expose only allowlisted public fields. See `CODING_STANDARD.md` §9.5.
- [ ] The reset endpoint remains absent from production and secret-gated in non-production. See `CODING_STANDARD.md` §9.6.

## Tests and Verification

- [ ] Unit tests are in `tests/unit/` and Playwright E2E tests are in `tests/e2e/`. See `CODING_STANDARD.md` §8.1.
- [ ] Tests follow Arrange, Act, Assert and assert focused observable behavior. See `CODING_STANDARD.md` §8.2.
- [ ] Behavior changes include tests for success, expected failure, authorization, privacy, and persistence paths where relevant. See `CODING_STANDARD.md` §8.3.
- [ ] Mocks are only at external boundaries such as daily.dev, time, or database clients. See `CODING_STANDARD.md` §8.4.
- [ ] **(CI)** `bun run lint` passes. See `CODING_STANDARD.md` §7.4.
- [ ] **(CI)** `bun run format` passes. See `CODING_STANDARD.md` §7.3 and §7.4.
- [ ] **(CI)** `bun run test` passes. See `CODING_STANDARD.md` §7.4 and §8.1.
- [ ] **(CI)** `bun run test:e2e` passes. See `CODING_STANDARD.md` §7.4 and §8.1.
- [ ] **(CI)** `bun run build` passes. See `CODING_STANDARD.md` §7.4.
- [ ] **(CI)** `bun run complete-check` passes before merge. See `CODING_STANDARD.md` §7.4.

## Dependencies, Comments, and Commits

- [ ] Dependency changes use Bun, keep exact package versions, and do not add another lockfile. See `CODING_STANDARD.md` §7.1 and §7.2.
- [ ] Comments explain only non-obvious reasons or constraints, not what the code already says. See `CODING_STANDARD.md` §10.1.
- [ ] The PR contains no commented-out code, dead code, or unsanctioned `TODO` or `FIXME` markers. See `CODING_STANDARD.md` §10.2.
- [ ] Commits use Conventional Commit prefixes with imperative summaries. See `CODING_STANDARD.md` §11.1.
