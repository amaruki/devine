# 9. Authentication and Authorization

## 9.1 Authentication model

Devine uses first-party username and password accounts. A user creates an account with a unique normalized username, optional email, and password that is hashed with Argon2id before persistence. daily.dev Personal Access Tokens are integration credentials only, not Devine login credentials. Serves AC-02.01 through AC-02.17, AC-20.01, AC-20.02, AC-21.01, and AC-21.02.

## 9.2 Account rules

| Concern                | Decision                                                                                                  | Serves             |
| ---------------------- | --------------------------------------------------------------------------------------------------------- | ------------------ |
| Username normalization | Lowercase before uniqueness comparison.                                                                   | AC-02.10           |
| Username syntax        | 3 to 24 characters, letters, numbers, underscores, starts with a letter or number.                        | AC-02.11           |
| Reserved usernames     | Reject `admin`, `api`, `auth`, `dashboard`, `settings`, `share`, `demo`, `support`, `root`, and `system`. | AC-02.12           |
| Password policy        | At least 8 characters with uppercase, lowercase, number, and symbol.                                      | AC-02.13           |
| Password hashing       | Argon2id with versioned parameters stored alongside the hash.                                             | AC-02.03           |
| Email                  | Optional at signup. Recovery is unavailable until email is present.                                       | AC-02.17, AC-21.02 |

## 9.3 Session strategy

| Concern        | Decision                                                                                            | Rationale                                                                                      |
| -------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Cookie         | httpOnly, `Secure` in production, `SameSite=Lax`, 7-day expiry.                                     | Prevents browser JavaScript from reading the session token while preserving normal navigation. |
| JWT            | Signed JWT stored in the cookie.                                                                    | Matches AC-02.14 and keeps protected-route validation explicit.                                |
| Claims         | `userId`, `username`, `role`, `sessionId`, `iat`, `exp`, and `tokenVersion`.                        | Matches AC-02.15 and supports revocation.                                                      |
| Server session | `sessions` table stores session ID, user ID, expiry, revocation timestamp, and last-seen timestamp. | Supports logout, auditability, and token-version invalidation.                                 |
| Refresh        | Successful login issues a new 7-day session.                                                        | Matches AC-02.16.                                                                              |
| Validation     | Protected routes verify JWT signature, expiry, token version, and active database session.          | Prevents stale or revoked cookies from authorizing requests.                                   |

## 9.4 Authorization rules

| Actor                                        | Allowed                                                                                                           | Denied                                                                                                         |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Visitor                                      | View landing, register, log in, view public share snapshots.                                                      | View dashboard, settings, private events, inventory, demo state, or token status.                              |
| Authenticated user                           | Read and mutate own dashboard, settings, demo state, inventory, daily.dev connection, and share snapshots.        | Read or mutate another user's private state.                                                                   |
| Superadmin                                   | Provision and reset prepared judge demo accounts, assist account recovery, and run controlled support operations. | Read plaintext daily.dev tokens or bypass public snapshot privacy.                                             |
| Public share viewer                          | Read public snapshot projection by `public_id`.                                                                   | Access token, raw events, comments, email, internal user ID, daily.dev profile ID, or private dashboard state. |
| Operator with reset secret in non-production | Call reset-state with `dev` or `qa` seed.                                                                         | Call reset-state in production or pass arbitrary seed paths.                                                   |
| Public health checker                        | Call `GET /health`.                                                                                               | Read secrets, full errors, environment values, or user data.                                                   |

## 9.5 Role matrix

| Capability                     | Visitor | User | Superadmin | Public viewer |      Reset operator |
| ------------------------------ | ------: | ---: | ---------: | ------------: | ------------------: |
| View landing page              |     yes |  yes |        yes |           yes |                 yes |
| Create account                 |     yes |   no |        yes |            no |                  no |
| Log in                         |     yes |  yes |        yes |            no |                  no |
| View own dashboard             |      no |  yes |        yes |            no |                  no |
| Save own daily.dev token       |      no |  yes |        yes |            no |                  no |
| Delete own token               |      no |  yes |        yes |            no |                  no |
| Simulate own demo activity     |      no |  yes |        yes |            no |                  no |
| Use own power-up               |      no |  yes |        yes |            no |                  no |
| Create own share snapshot      |      no |  yes |        yes |            no |                  no |
| Soft-delete own share snapshot |      no |  yes |        yes |            no |                  no |
| View public share snapshot     |     yes |  yes |        yes |           yes |                 yes |
| Provision judge accounts       |      no |   no |        yes |            no |                  no |
| Reset judge account state      |      no |   no |        yes |            no |                  no |
| Reset database state           |      no |   no |         no |            no | non-production only |

## 9.6 daily.dev token strategy

The daily.dev Personal Access Token is accepted only through settings or token validation routes for authenticated users. The plain token exists only in request memory during validation or API calls, then is encrypted before persistence. Client components receive only connection status and safe profile metadata.

## 9.7 Account recovery

MVP recovery may be superadmin-assisted when reset-link email is not implemented. Post-MVP recovery uses the optional email and a reset-link flow. Recovery actions create audit events and increment `token_version` when they invalidate sessions. Serves AC-21.01 and AC-21.02.
