# 11. Environment Configuration

## 11.1 Environment variables

| Variable                        | Local dev               | Test              | Preview or QA   | Production        | Required      | Notes                                                                                                             |
| ------------------------------- | ----------------------- | ----------------- | --------------- | ----------------- | ------------- | ----------------------------------------------------------------------------------------------------------------- |
| `APP_ENV`                       | `development`           | `test`            | `qa`            | `production`      | yes           | Controls environment-specific behavior.                                                                           |
| `DATABASE_URL`                  | local or Neon dev URL   | test database URL | Neon QA URL     | Neon prod URL     | yes           | Used by Drizzle client, migrate, and seed runners.                                                                |
| `DAILYDEV_TOKEN_ENCRYPTION_KEY` | dev key                 | test key          | QA key          | prod key          | yes           | Base64 256-bit key for AES-GCM token encryption.                                                                  |
| `SESSION_SECRET`                | dev secret              | test secret       | QA secret       | prod secret       | yes           | Signs JWT session cookies for account auth.                                                                       |
| `RESET_STATE_SECRET`            | dev reset secret        | test reset secret | QA reset secret | absent            | non-prod only | Required only when reset route is enabled.                                                                        |
| `ENABLE_RESET_API`              | `true`                  | `true`            | `true`          | absent or `false` | non-prod only | Route registration flag for `POST /admin/reset-state`.                                                            |
| `DEFAULT_SEED`                  | `dev`                   | `qa`              | `qa`            | absent            | no            | Default seed for reset if the endpoint chooses to support omission later. MVP request body still requires `seed`. |
| `DAILYDEV_SERVER_TOKEN`         | optional                | absent            | optional        | optional          | no            | Server-wide token for fallback or non-personal content only. Never infer personal behavior from it.               |
| `NEXT_PUBLIC_APP_URL`           | `http://localhost:3000` | test URL          | preview URL     | production URL    | yes           | Public URL for share links. Contains no secrets.                                                                  |

## 11.2 Production restrictions

In production:

1. `APP_ENV=production`.
2. `ENABLE_RESET_API` is absent or `false`.
3. `RESET_STATE_SECRET` is absent.
4. `POST /admin/reset-state` is not registered.
5. Demo mode remains available.
6. `GET /health` remains public and secret-free.

## 11.3 Local development defaults

Local development may use Neon dev or local Postgres through `DATABASE_URL`. The database reset endpoint may be enabled locally for rapid QA, but still requires the reset secret so local and QA behavior match.

## 11.4 Configuration validation

On server startup or first server-side access, validate required environment variables with a Zod schema. Client code may access only `NEXT_PUBLIC_APP_URL` and other future `NEXT_PUBLIC_*` values that contain no secrets.
