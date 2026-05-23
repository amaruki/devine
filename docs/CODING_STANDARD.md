# Coding Standard

This project is a Bun-run Next.js 16 App Router application for the Devine daily.dev reading pet MVP. It uses TypeScript strict mode, React 19, Tailwind CSS 4, Drizzle ORM with Postgres, Zod for boundary validation, Bun unit tests, Playwright E2E tests, oxlint, and oxfmt. Run `bun run complete-check` before merge. The full gate is `bun run type-check`, `bun run lint`, `bun run format`, `bun run test`, `bun run test:e2e`, and `bun run build`.

## 1. Language and Types

### 1.1 Use strict TypeScript without escape hatches. **(enforced in part)**

Write application code in TypeScript and keep `strict` mode clean. Do not use `any`, unchecked casts with `as`, or non-null assertions. Use narrowing, discriminated unions, and schema-derived types.

Rationale: the MVP stores user state, sessions, and tokens, so type gaps become correctness and privacy bugs.

```diff
- const status = payload.status as HealthState;
+ if (payload.status !== "stable" && payload.status !== "tired") {
+   return { status: "error", message: "Invalid health state" };
+ }
+ const status = payload.status;
```

### 1.2 Give exported functions explicit return types.

Every exported non-component function returns an explicit type. React page and component return types may be inferred.

Rationale: module contracts in `lib/` and route handlers must stay stable as implementation replaces scaffold stubs.

```diff
- export async function getHealth() {
+ export async function getHealth(): Promise<HealthResponse> {
    return health;
  }
```

### 1.3 Prefer literal unions and discriminated unions.

Represent fixed domain states as literal unions and expected operation outcomes as discriminated unions.

Rationale: health states, roles, quest statuses, and API responses are finite contracts that reviewers can exhaustively check.

```diff
- export type AuthResult = { ok: boolean; message?: string };
+ export type AuthResult =
+   | { status: "ok"; context: AuthContext }
+   | { status: "error"; message: string };
```

### 1.4 Derive request and response types from validation schemas where possible.

Use Zod at system boundaries and derive TypeScript types with `z.infer` instead of duplicating shapes by hand.

Rationale: validation and static types must have one source of truth.

```diff
  export const resetStateRequestSchema = z.object({
    seed: z.enum(["dev", "qa"]),
  });
- export type ResetStateRequest = { seed: "dev" | "qa" };
+ export type ResetStateRequest = z.infer<typeof resetStateRequestSchema>;
```

## 2. Naming

### 2.1 Use kebab-case folders and framework filenames.

Use lowercase kebab-case for feature folders and Next.js framework filenames such as `page.tsx`, `layout.tsx`, `actions.ts`, and `route.ts`.

Rationale: the App Router and existing docs define routes through folder names.

```diff
- app/share/SnapshotPage.tsx
+ app/share/[snapshotId]/page.tsx
```

### 2.2 Use PascalCase for React components and type names.

Name exported React components and exported type aliases in PascalCase.

Rationale: component and contract names must be distinguishable from functions and values.

```diff
- export function duckAvatar() {}
+ export function DuckAvatar() {}

- export type health_response = {};
+ export type HealthResponse = {};
```

### 2.3 Use camelCase for functions, variables, and Drizzle table exports.

Name functions, local variables, and Drizzle table objects in camelCase.

Rationale: this matches the existing `validateDailyDevToken`, `dailyDevConnections`, and `resetStateRequestSchema` pattern.

```diff
- export const daily_dev_connections = pgTable("daily_dev_connections", {});
+ export const dailyDevConnections = pgTable("daily_dev_connections", {});
```

### 2.4 Use snake_case for database table and column names.

Drizzle object keys use camelCase, but persisted table and column names use snake_case.

Rationale: TypeScript stays idiomatic while Postgres names remain conventional and migration-friendly.

```diff
- dailyDevProfileId: text("dailyDevProfileId"),
+ dailyDevProfileId: text("daily_dev_profile_id"),
```

## 3. Project Structure and Layering

### 3.1 Keep domain rules in `lib/<module>/` and independent of React.

Domain logic lives under `lib/scoring`, `lib/quests`, `lib/powerups`, `lib/activity`, `lib/share`, `lib/auth`, `lib/security`, `lib/demo`, `lib/speech`, and `lib/operations`. These modules do not import React, Next page modules, or components.

Rationale: domain behavior must be testable without rendering the app.

```diff
- import { DuckAvatar } from "@/components/duck/DuckAvatar";
-
  export function normalizeTag(tag: string) {
    return tag.trim().toLowerCase();
  }
```

### 3.2 Keep route handlers and server actions thin.

Route handlers and server actions validate input, authorize the caller, call `lib/` services, and map results to responses or redirects. They do not contain scoring, quest, token, or persistence rules.

Rationale: App Router files are boundaries, not business-rule containers.

```diff
  export async function POST(request: Request) {
    const parsed = schema.safeParse(await request.json());
-   const score = parsed.data.reads * 10 + parsed.data.comments * 5;
-   return Response.json({ score });
+   return Response.json(await createShareSnapshot(parsed.data));
  }
```

### 3.3 Keep database access behind `lib/db/`.

Only `lib/db/` creates Drizzle clients, defines schema, runs migrations, seeds data, or performs direct database queries. Other modules call repository or service functions.

Rationale: data access boundaries make transactions, privacy filtering, and tests controllable.

```diff
- import { db } from "@/lib/db/client";
-
  export async function createShareSnapshot(input: CreateShareSnapshotInput) {
-   return db.insert(shareSnapshots).values(input);
+   return shareSnapshotRepository.create(input);
  }
```

### 3.4 Keep reusable UI primitives presentation-only.

Components under `components/ui/` accept props and children, render markup, and do not fetch data or mutate state.

Rationale: primitives such as `Card` must stay safe to reuse in any route.

```diff
- export async function Card({ children }: { children: ReactNode }) {
-   const user = await requireUser();
+ export function Card({ children }: { children: ReactNode }) {
    return <section>{children}</section>;
  }
```

### 3.5 Do not import module internals across features.

Cross-feature imports use the feature public entry point, usually `@/lib/<module>` or a named service function, not private implementation files.

Rationale: feature modules must remain movable and reviewable as implementation grows.

```diff
- import { validateDailyDevToken } from "@/lib/dailydev/client";
+ import { validateDailyDevToken } from "@/lib/dailydev";
```

## 4. File and Function Size

### 4.1 Cap source files at 300 lines and split at 250.

Keep application source files under 300 lines. When a file approaches 250 lines, extract cohesive pieces into a sibling feature folder or focused module, not a generic `utils` dump.

Rationale: small files are easier to review, test, and navigate.

```diff
- lib/share/index.ts        # 420 lines of validation, projection, and database code
+ lib/share/index.ts        # public exports
+ lib/share/projection.ts   # public snapshot projection
+ lib/share/repository.ts   # database persistence
```

### 4.2 Keep exported functions focused on one operation.

An exported function performs one operation at its abstraction level. Split parsing, authorization, persistence, and projection when they grow independently.

Rationale: focused functions make unit tests target behavior instead of setup noise.

```diff
- export async function dashboardAction(input: FormData) {
-   // parse, authorize, score, persist, and render response
- }
+ export async function applyDemoDashboardAction(input: DemoActionInput): Promise<DemoActionResult> {
+   return demoDashboardService.apply(input);
+ }
```

## 5. Error Handling and API Contracts

### 5.1 Return result unions for expected failures.

Expected validation, auth, user-facing, and integration failures return discriminated result unions. Do not throw raw `Error` for expected user or external-service outcomes.

Rationale: boundaries can map results to stable HTTP responses and UI states without guessing exception meaning.

```diff
- throw new Error("daily.dev token is required");
+ return { status: "error", message: "daily.dev token is required" };
```

### 5.2 Throw only for impossible invariants and missing required server configuration.

Use throws for startup or invariant failures that the app cannot safely recover from, such as a missing required server secret in the config module.

Rationale: unrecoverable server misconfiguration should fail fast.

```diff
- return { status: "error", message: "DATABASE_URL is required" };
+ throw new Error("DATABASE_URL is required");
```

### 5.3 Map errors at the boundary.

Route handlers and server actions translate service results into HTTP status codes or form state. They do not leak raw exception messages to public responses.

Rationale: public contracts must be stable and secret-free.

```diff
- return Response.json({ status: "error", message: String(error) }, { status: 500 });
+ return Response.json({ status: "error", message: "Unable to validate token" }, { status: 502 });
```

### 5.4 Use `Response.json` with explicit response shapes in route handlers.

Route handlers return typed JSON objects that satisfy an exported or local response type.

Rationale: API contracts should be reviewable from the route file.

```diff
- return Response.json({ profile });
+ return Response.json({ status: "ok", profile } satisfies TestConnectionResponse);
```

## 6. Async, Transactions, and External Services

### 6.1 Put every atomic multi-step write in one transaction.

Any operation that mutates related user state, activity, inventory, snapshots, sessions, or audit records runs inside one repository or service transaction.

Rationale: the game loop must not partially apply rewards, health, inventory, or audit changes.

```diff
- await saveActivity(event);
- await updateInventory(reward);
+ await userStateRepository.applyActivityWithReward(event, reward);
```

### 6.2 Keep daily.dev failures recoverable.

Connected-mode daily.dev failures return degraded or retryable results. Demo mode and stored share pages must continue to work without daily.dev.

Rationale: the product requirement says daily.dev outages must not block the MVP demo.

```diff
- const feed = await fetchDailyDevFeed(token);
- return renderDashboard(feed);
+ const feedResult = await loadDailyDevFeed(token);
+ return buildDashboardModel(feedResult);
```

### 6.3 Do not add queues, caches, or background workers for MVP code.

Use synchronous server-side operations and small rolling calculations unless a documented requirement changes.

Rationale: the technical spec deliberately excludes Redis, queues, and workers for this MVP.

```diff
- await queue.publish("refresh-dashboard", userId);
+ await refreshDashboardState(userId);
```

## 7. Dependencies, Tooling, and Formatting

### 7.1 Use Bun for package and script execution. **(enforced)**

Run project commands with Bun and keep `bun.lock` committed. Do not introduce another package manager lockfile.

Rationale: CI and docs pin Bun 1.3 for the MVP.

```diff
- npm install zod
+ bun add zod
```

### 7.2 Pin dependency versions.

Add dependencies with exact versions and upgrade them deliberately through a dependency task that passes `bun run complete-check`.

Rationale: pinned versions keep hackathon and CI behavior reproducible.

```diff
- "next": "^16.0.4"
+ "next": "16.0.4"
```

### 7.3 Let oxfmt own formatting. **(enforced)**

Do not hand-format around the formatter. Use `bun run format` to check and `bun run format:write` to apply formatting.

Rationale: formatting debates should not consume review time.

```diff
- Manually align object properties for aesthetics.
+ Run bun run format:write.
```

### 7.4 Run the complete gate before merge. **(enforced in CI)**

A PR is merge-ready only when `bun run complete-check` passes.

Rationale: the aggregate command covers type checking, linting, formatting, unit tests, E2E tests, and build.

```diff
- bun run test
+ bun run complete-check
```

## 8. Tests

### 8.1 Put unit tests in `tests/unit/` and E2E tests in `tests/e2e/`.

Use Bun unit tests for pure modules and route-contract logic. Use Playwright for user-visible golden paths.

Rationale: fast tests cover domain behavior while Playwright verifies the real app surface.

```diff
- app/dashboard/dashboard.test.ts
+ tests/unit/dashboard.test.ts
+ tests/e2e/dashboard.spec.ts
```

### 8.2 Write tests in Arrange, Act, Assert form.

Each test sets up input, performs one behavior, and asserts the observable result. Keep the assertion target focused.

Rationale: focused tests make failures explain one broken contract.

```diff
- test("health", async () => {
-   expect(await getHealth()).toBeTruthy();
- });
+ test("returns the explicit health contract", async () => {
+   await expect(getHealth()).resolves.toMatchObject({ status: "ok" });
+ });
```

### 8.3 Test every acceptance-criterion path that changes behavior.

Behavioral changes include the success path, expected failure path, authorization boundary, privacy projection, and persistence side effects relevant to the acceptance criterion.

Rationale: the app is requirement-driven and privacy-sensitive.

```diff
- test("share works", async () => {});
+ test("public share snapshot excludes private identifiers", async () => {});
```

### 8.4 Mock only external boundaries.

Mock daily.dev, time, and database clients at the deepest practical boundary. Do not mock intermediate services to test their callers.

Rationale: mocks should isolate external nondeterminism, not hide integration bugs inside the app.

```diff
- mock.module("@/lib/scoring", () => ({ calculateScore: () => 10 }));
+ mockDailyDevResponse({ posts: [] });
```

## 9. Security, Privacy, and Configuration

### 9.1 Read environment variables through one validated config module.

New code must not scatter direct `process.env` reads. Use a server-only Zod-validated config module. Existing direct reads are scaffold debt and must be moved when touched.

Rationale: required secrets and public config need one validation and redaction boundary.

```diff
- const secret = process.env.RESET_STATE_SECRET;
+ const secret = serverConfig.RESET_STATE_SECRET;
```

### 9.2 Keep secrets server-only.

Never serialize passwords, session secrets, daily.dev tokens, encrypted-token internals, authorization headers, or database URLs into client props, public JSON, logs, or share snapshots.

Rationale: the app handles account credentials and personal daily.dev access tokens.

```diff
- return Response.json({ token, profile });
+ return Response.json({ status: "ok", profile });
```

### 9.3 Validate all external input with Zod at the boundary.

Validate request bodies, forms, reset inputs, token-test inputs, share-creation inputs, and external API payloads before use.

Rationale: validation belongs where untrusted data enters the system.

```diff
- const body = await request.json();
- return resetState(body);
+ const parsed = resetStateRequestSchema.safeParse(await request.json());
+ if (!parsed.success) {
+   return Response.json({ status: "error", message: "Invalid request body" }, { status: 400 });
+ }
```

### 9.4 Enforce ownership on every private mutation.

Authenticated users may mutate only their own state. Superadmin-only operations must require a superadmin context.

Rationale: cross-user mutation is the main authorization risk in the app.

```diff
- await updateUserState(requestedUserId, input);
+ await updateUserState(authContext.userId, input);
```

### 9.5 Keep public share snapshots allowlisted.

Public share pages may expose only seniority level, seniority score, health state, top tags, speech bubble, generated date, and powered-by attribution.

Rationale: share pages must not leak private activity, user IDs, daily.dev profile IDs, comments, tokens, or article lists.

```diff
- return { ...user, ...activityEvents };
+ return pickPublicShareSnapshot(snapshot);
```

### 9.6 Keep the reset endpoint absent from production.

`POST /admin/reset-state` must not be registered or reachable in production. Non-production access requires `Authorization: Bearer <RESET_STATE_SECRET>`.

Rationale: reset-state is a QA and local-development tool only.

```diff
- if (!isAuthorized(request)) return Response.json({ status: "unauthorized" }, { status: 401 });
+ if (!isResetApiEnabled()) return Response.json({ status: "not_found" }, { status: 404 });
+ if (!isAuthorized(request)) return Response.json({ status: "unauthorized" }, { status: 401 });
```

## 10. Comments, Dead Code, and Partial Work

### 10.1 Prefer self-documenting code over comments.

Do not explain what code does. Add a short comment only when the reason is non-obvious, such as a security invariant or external service constraint.

Rationale: stale comments mislead reviewers more than concise code helps them.

```diff
- // Trim and lowercase the tag.
  export function normalizeTag(tag: string) {
    return tag.trim().toLowerCase();
  }
```

### 10.2 Do not ship commented-out code, dead code, or TODO markers.

Delete unused code instead of commenting it out. Do not merge `TODO` or `FIXME` markers unless the PR description names an approved deferral.

Rationale: version control remembers deleted code, and unresolved markers hide partial work.

```diff
- // TODO: validate this later
- // await oldValidation(input);
+ await validateInput(input);
```

### 10.3 Keep scaffold placeholders explicit.

Unimplemented MVP stubs must return explicit `not_implemented` contracts or similarly clear placeholder UI text. Do not make placeholders look successful.

Rationale: reviewers and E2E tests need to distinguish scaffold from complete behavior.

```diff
- return { status: "ok" };
+ return { status: "not_implemented", message: "Registration will be implemented in Sprint 1." };
```

## 11. Commits and Documentation

### 11.1 Use Conventional Commits.

Commit messages use Conventional Commit prefixes such as `feat:`, `fix:`, `test:`, `docs:`, `refactor:`, `chore:`, and imperative summaries.

Rationale: the repo has no long commit history yet, so a consistent convention should start now.

```diff
- updated stuff
+ feat: add dailydev token validation route
```

### 11.2 Update docs when contracts or architecture change.

If a PR changes route contracts, folder responsibilities, security rules, environment variables, or verification commands, update the matching docs under `docs/technical-specs/` or the root standard files.

Rationale: this project already uses technical specs as implementation guidance.

```diff
- Change RESET_STATE_SECRET behavior only in code.
+ Change RESET_STATE_SECRET behavior in code and docs/technical-specs/11-environment-configuration.md.
```
