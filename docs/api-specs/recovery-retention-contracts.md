# Recovery and Retention API Contracts

**Version:** 1.0.0  
**Date:** 2026-05-24  
**Author:** Claude Code  
**Status:** Approved  
**Phase:** Sprint 5

## Scope

Covers share snapshot soft deletion, privacy-safe deleted public behavior, retention cleanup, production hardening checks, and optional email recovery scope.

Serves: AC-14.06, AC-14.07, AC-14.08, AC-14.09, AC-14.10, AC-19.01, AC-19.02, AC-19.03, AC-19.04, AC-19.05, AC-19.08, AC-21.01, AC-21.02

Sources: `../business/acceptance-criteria-breakdown/acceptance-criteria-sprint-5.md`, `../technical-specs/05-module-definitions.md`, `../technical-specs/06-data-model.md`, `../technical-specs/07-security.md`, `../technical-specs/08-non-functional-requirements.md`, `../technical-specs/09-authentication-and-authorization.md`, `../technical-specs/14-share-snapshot-privacy-strategy.md`

## Share snapshot listing

### `getMyShareSnapshots()`

Server-only settings or dashboard loader.

```ts
type ShareSnapshotListItem = {
  publicId: string;
  url: string;
  seniorityLevel: SeniorityLevel;
  seniorityScore: number;
  healthState: HealthState;
  generatedAt: string;
  deletedAt: string | null;
};

type ShareSnapshotListResult = {
  items: ShareSnapshotListItem[];
};
```

Rules:

1. Requires authenticated user.
2. Returns only snapshots owned by the caller.
3. Does not expose internal UUIDs, source snapshot IDs, user IDs, raw events, daily.dev profile IDs, tokens, or email.
4. May include deleted snapshots for owner auditability when the UI needs them.

## Soft-delete share snapshot

### `softDeleteShareSnapshot(input)`

Server action.

```ts
type SoftDeleteShareSnapshotInput = {
  publicId: string;
};

type SoftDeleteShareSnapshotResult = {
  publicId: string;
  deletedAt: string;
};
```

Rules:

1. Requires authenticated user.
2. Snapshot must belong to the caller.
3. Sets `deleted_at` or equivalent soft-delete marker.
4. Public route no longer returns the original public card after deletion.
5. Creates `snapshot_delete` audit event.
6. Repeated delete is idempotent and returns the existing deletion timestamp.

Errors:

| Condition                   | Status | Error code            |
| --------------------------- | ------ | --------------------- |
| Missing session             | 401    | `unauthorized`        |
| Snapshot not found for user | 404    | `not_found`           |
| Invalid public ID syntax    | 400    | `invalid_public_id`   |
| Database unavailable        | 503    | `service_unavailable` |

## Deleted public snapshot behavior

### `getPublicShareSnapshot(publicId)` deleted state

Public route behavior extends `demo-share-contracts.md`.

```ts
type DeletedShareSnapshot = {
  publicId: string;
  deleted: true;
  message: string;
};
```

Rules:

1. Requires no session.
2. Soft-deleted snapshots return HTTP `410 Gone` with a branded deleted page.
3. Unknown public IDs return HTTP `404 Not Found` with the same public shape as deletion (no enumeration signal).
4. Deleted state does not reveal owner username, email, raw events, internal IDs, deletion actor, or private reason.
5. The response body for both `404` and `410` is identical: `{ found: false, message: "This snapshot is no longer available." }`.

## Retention cleanup

### `runRetentionCleanup(input)`

Superadmin-only or scheduled server function. It is not a public user route for MVP.

```ts
type RetentionCleanupInput = {
  dryRun?: boolean;
};

type RetentionCleanupResult = {
  dryRun: boolean;
  deletedActivityEvents: number;
  deletedDailySnapshots: number;
  deletedShareSnapshots: number;
  deletedAuditEvents: number;
  ranAt: string;
};
```

Rules:

1. Requires superadmin or trusted scheduled execution context.
2. Applies documented retention policy without deleting active account identity needed for login.
3. Preserves auditability required for security and support.
4. Creates redacted audit metadata for manual runs.
5. `dryRun` reports counts without deleting.

Errors:

| Condition                | Error code       |
| ------------------------ | ---------------- |
| Caller is not superadmin | `forbidden`      |
| Cleanup fails mid-run    | `cleanup_failed` |

## Account recovery request

### `requestAccountRecovery(input)`

MVP scope is explicit because reset-link email may be post-MVP.

```ts
type AccountRecoveryRequestInput = {
  usernameOrEmail: string;
};

type AccountRecoveryRequestResult = {
  accepted: true;
  message: string;
};
```

Rules:

1. Public action accepts a username or optional email identifier.
2. Response is always generic to avoid account enumeration.
3. If the user has no email, recovery is unavailable until email is present.
4. If reset-link email is not implemented, the action records or explains superadmin-assisted recovery scope.
5. Creates `account_recovery_request` audit event when an account match is processed.
6. Does not invalidate sessions by itself.

Response `200`:

```json
{
  "ok": true,
  "data": {
    "accepted": true,
    "message": "If recovery is available for this account, follow the next instruction shown or sent."
  }
}
```

Errors:

| Condition                 | Error code                    |
| ------------------------- | ----------------------------- |
| Invalid identifier syntax | `invalid_recovery_identifier` |
| Rate limit exceeded       | `rate_limited`                |

## Superadmin-assisted password reset

### `resetUserPassword(input)`

Superadmin-only support action for MVP recovery if reset-link email is not implemented.

```ts
type ResetUserPasswordInput = {
  username: string;
  temporaryPassword: string;
};

type ResetUserPasswordResult = {
  username: string;
  resetAt: string;
  sessionsInvalidated: true;
};
```

Rules:

1. Requires authenticated superadmin.
2. New password must satisfy password policy.
3. Stores only Argon2id hash.
4. Increments `users.token_version` and revokes active sessions.
5. Creates redacted audit event.
6. Never returns existing password hash or plaintext credentials.

Errors:

| Condition                | Error code      |
| ------------------------ | --------------- |
| Caller is not superadmin | `forbidden`     |
| Target user not found    | `not_found`     |
| Weak temporary password  | `weak_password` |

## Retention policy (AC-14.09)

MVP retention durations applied by `runRetentionCleanup`:

| Table                     | Retention    | Notes                                               |
| ------------------------- | ------------ | --------------------------------------------------- |
| `activity_events`         | 180 days     | Preserves scoring recalc window.                    |
| `daily_pet_snapshots`     | 90 days      | Daily aggregates; 90 days covers 12-week seniority. |
| `share_snapshots`         | 90 days      | From `deleted_at`, not `created_at`.                |
| `audit_events`            | 365 days     | Security and support minimum.                       |
| `sessions`                | Auto-expire  | Sessions already expire at 7 days + token_version.  |
| `active_power_up_effects` | After expiry | Consumed effects removed; stale effects cleaned up. |

Active accounts (users who logged in within 90 days) are never deleted. Retention cleanup preserves `users`, `daily_dev_connections`, `power_up_inventory`, `quests`, and `demo_states` rows for active accounts.

## Production hardening contract

Every endpoint and server action in this directory must satisfy these release checks.

### Release safety checklist

| Concern              | Required behavior                                                                                                      |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Secrets              | No response includes secrets, tokens, hashes, encrypted token internals, environment values, or authorization headers. |
| Validation           | All public request bodies and server action inputs are schema-validated.                                               |
| Authorization        | Mutations are scoped to the current user unless explicitly superadmin-only.                                            |
| Public share privacy | Public projections expose only allowlisted snapshot fields.                                                            |
| Degraded states      | daily.dev and database failures map to stable error codes or degraded UI states.                                       |
| Health               | `GET /health` stays public, fast, and secret-free.                                                                     |
| Reset-state          | Non-production only and absent in production.                                                                          |
| Logging              | Logs redact credentials, tokens, raw comments, authorization headers, and encryption payload internals.                |

### Production environment invariants

| Invariant                            | Enforcement                                          |
| ------------------------------------ | ---------------------------------------------------- |
| `APP_ENV=production`                 | Set in Vercel production environment.                |
| `ENABLE_RESET_API` absent or `false` | Reset route not registered.                          |
| `RESET_STATE_SECRET` absent          | No reset bearer token accepted.                      |
| `NODE_ENV=production`                | Next.js optimizations active.                        |
| `Secure` cookie flag                 | `true` in production, `false` in development.        |
| No debug logging                     | Error details logged server-side, not in responses.  |
| `DAILYDEV_SERVER_TOKEN` optional     | Never used for personal data; fallback content only. |

### US-21 recovery follow-up boundaries

US-21 implementation is optional for Sprint 5. If not implemented, these boundaries apply:

1. `requestAccountRecovery` returns the generic accepted message but takes no further action.
2. `resetUserPassword` (superadmin-assisted) is the only password reset path.
3. No email service integration exists. The `email` column on `users` is stored but unused for recovery.
4. If US-21 is implemented post-MVP, the existing `requestAccountRecovery` contract supports email-based reset-link flow without contract changes.

## Downstream contract checklist

| Backend card | Contracts consumed                                                                   |
| ------------ | ------------------------------------------------------------------------------------ |
| BE-S5-01     | `SoftDeleteShareSnapshotInput/Result`, `DeletedShareSnapshot`, 404/410 HTTP behavior |
| BE-S5-02     | `RetentionCleanupInput/Result`, retention policy table                               |
| BE-S5-03     | `AccountRecoveryRequestInput/Result`, `ResetUserPasswordInput/Result`                |
| BE-S5-04     | Production hardening checklist, environment invariants                               |
| FE-S5-01     | `ShareSnapshotListItem`, deleted state UI, 410 page                                  |
| FE-S5-02     | Recovery request UI, superadmin reset UI (if US-21 implemented)                      |
