# 7. Security

## 7.1 Security posture

Devine treats passwords, sessions, and daily.dev tokens as secrets, share pages as public content, and demo controls as authenticated user actions. Security effort focuses on password storage, session integrity, token confidentiality, route boundaries, request validation, and preventing public snapshots from leaking private activity.

## 7.2 Controls by concern

| Concern          | Implementation                                                                                                      | Serves                   |
| ---------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| Password storage | Hash account passwords with Argon2id and never store or log plaintext passwords.                                    | US-02                    |
| Session identity | Store a signed JWT in an httpOnly, SameSite=Lax, secure production cookie and verify it against a database session. | US-02                    |
| Token storage    | Encrypt daily.dev Personal Access Tokens server-side before persistence. Never store tokens in localStorage.        | US-03, US-19             |
| Token use        | Decrypt tokens only inside server actions or route handlers. Never serialize tokens into client props.              | US-03, US-19             |
| Input validation | Validate auth forms, settings forms, activity simulation input, reset-state requests, and share creation with Zod.  | US-02, US-19             |
| Authorization    | Authenticated users may mutate only their own state. Share pages use public IDs and return public projections only. | US-02, US-14, US-19      |
| Rate limiting    | Lightweight per-session limits on login, token test, share creation, and demo action routes.                        | US-02, US-03, US-14      |
| CORS             | Default same-origin. No broad CORS headers for app routes.                                                          | Token and session safety |
| CSP              | Add a restrictive CSP compatible with Next.js, Tailwind, and motion.                                                | XSS impact reduction     |
| Logs             | Never log passwords, tokens, encrypted payload internals, raw user comments, or authorization headers.              | US-02, US-03, US-19      |

## 7.3 Password and session security

Passwords are hashed with Argon2id and versioned parameters. Session cookies contain signed JWTs with user ID, username, role, session ID, issued-at, expiry, and token version claims. Protected routes verify the JWT signature, expiry, token version, and active `sessions` row before loading private state.

Failed login attempts create audit events without storing plaintext credentials. Account recovery and superadmin resets increment `users.token_version` when they invalidate existing sessions.

## 7.4 Token encryption

`DAILYDEV_TOKEN_ENCRYPTION_KEY` stores a base64 encoded 256-bit key. Encryption uses AES-GCM with a random IV per token. The encrypted payload stores only ciphertext, IV, algorithm metadata, and key version.

## 7.5 Share snapshot privacy

Public share pages may expose only seniority level, seniority score, health state, top tags, speech bubble, generated date, and powered-by attribution. They must not expose email, token, raw events, user ID, daily.dev profile ID, comments, private identifiers, or full article lists. Serves US-14 and US-19.

## 7.6 Operational endpoint policy

`GET /health` is public. It returns liveness and dependency status, not secrets, environment values, connection strings, or detailed exception messages.

`POST /admin/reset-state` is registered only when `APP_ENV` is not `production` and `ENABLE_RESET_API=true`. The route is absent in production, not merely blocked by authorization. In environments where it exists, it requires `Authorization: Bearer <RESET_STATE_SECRET>`, accepts only `seed: "dev"` or `seed: "qa"`, and runs the versioned migration and seed mechanisms described in `06-data-model.md §6.15`.

## 7.7 Threat surface and mitigations

| Threat                                   | Mitigation                                                                                           |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Password disclosure                      | Argon2id hashing, no plaintext persistence, and no credential logging.                               |
| Session replay after logout              | Database session validation plus token-version checks on protected routes.                           |
| Token exfiltration through browser props | Server-only token access and no client serialization.                                                |
| Token leakage through logs               | Structured redaction and no logging of request bodies for token routes.                              |
| Cross-user state mutation                | Session-bound user lookup on every mutation.                                                         |
| Share page data leakage                  | Separate `share_snapshots` table with copied allowlisted fields only.                                |
| Reset endpoint exposed in production     | Conditional route registration using environment checks.                                             |
| Activity farming                         | Daily caps, light friction, and no power-up effect on seniority. Complex anti-cheat is out of scope. |
| XSS in article titles or speech          | React escaping by default and no unsafe HTML rendering for user or API content.                      |
