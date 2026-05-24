import { describe, expect, test } from "bun:test";
import {
  normalizeEmail,
  normalizeUsername,
  validatePassword,
  validateUsername,
} from "@/features/auth/domain";
import type { AuthDependencies, AuthUserRecord } from "@/features/auth/application/ports";
import {
  getCurrentUserWithDependencies,
  loginUserWithDependencies,
  logoutUserWithDependencies,
  registerUserWithDependencies,
} from "@/features/auth/application/use-cases";

describe("auth validation", () => {
  test("normalizes usernames before uniqueness checks", () => {
    const normalized = normalizeUsername("  Amaruki_42  ");

    expect(normalized).toBe("amaruki_42");
  });

  test("rejects reserved usernames", () => {
    const result = validateUsername("Dashboard");

    expect(result).toBe("reserved_username");
  });

  test("rejects invalid username syntax", () => {
    const result = validateUsername("_duck");

    expect(result).toBe("invalid_username");
  });

  test("accepts valid username syntax", () => {
    const result = validateUsername("duck_reader_7");

    expect(result).toBeNull();
  });

  test("enforces password complexity", () => {
    expect(validatePassword("weakpass")).toBeFalse();
    expect(validatePassword("Strong1!")).toBeTrue();
  });

  test("normalizes optional email", () => {
    expect(normalizeEmail("  DUCK@example.COM  ")).toEqual({
      status: "ok",
      email: "duck@example.com",
    });
    expect(normalizeEmail("   ")).toEqual({ status: "ok", email: null });
    expect(normalizeEmail("not-email")).toEqual({ status: "error" });
  });
});

describe("auth use cases", () => {
  test("registers a user with normalized username, password hash, audit, and session", async () => {
    const dependencies = createFakeDependencies();

    const result = await registerUserWithDependencies(
      {
        username: "DuckDev",
        email: "DUCK@example.COM",
        password: "Strong1!",
      },
      dependencies,
    );

    expect(result.status).toBe("ok");
    expect(dependencies.state.users[0]).toMatchObject({
      username: "duckdev",
      email: "duck@example.com",
      passwordHash: "hashed:Strong1!",
    });
    expect(dependencies.state.audits).toContainEqual({
      actorUserId: "user-1",
      targetUserId: "user-1",
      type: "account_register",
      metadata: { username: "duckdev" },
    });
    expect(dependencies.state.sessions[0]?.userId).toBe("user-1");
  });

  test("rejects duplicate usernames before hashing", async () => {
    const dependencies = createFakeDependencies();
    dependencies.state.users.push(createUser({ username: "duckdev" }));

    const result = await registerUserWithDependencies(
      { username: "DuckDev", password: "Strong1!" },
      dependencies,
    );

    expect(result).toMatchObject({ status: "error", code: "username_taken" });
    expect(dependencies.state.hashInputs).toEqual([]);
  });

  test("rejects duplicate email before hashing", async () => {
    const dependencies = createFakeDependencies();
    dependencies.state.users.push(createUser({ username: "other", email: "duck@example.com" }));

    const result = await registerUserWithDependencies(
      { username: "duckdev", email: "DUCK@example.COM", password: "Strong1!" },
      dependencies,
    );

    expect(result).toMatchObject({ status: "error", code: "email_taken" });
    expect(dependencies.state.hashInputs).toEqual([]);
  });

  test("logs in with valid credentials and records audit", async () => {
    const dependencies = createFakeDependencies();
    dependencies.state.users.push(
      createUser({ username: "duckdev", passwordHash: "hashed:Strong1!" }),
    );

    const result = await loginUserWithDependencies(
      { username: "DuckDev", password: "Strong1!" },
      dependencies,
    );

    expect(result.status).toBe("ok");
    expect(dependencies.state.audits).toContainEqual({
      actorUserId: "user-1",
      targetUserId: "user-1",
      type: "login_success",
      metadata: { username: "duckdev" },
    });
  });

  test("rejects invalid login and records failed audit", async () => {
    const dependencies = createFakeDependencies();
    dependencies.state.users.push(
      createUser({ username: "duckdev", passwordHash: "hashed:Strong1!" }),
    );

    const result = await loginUserWithDependencies(
      { username: "duckdev", password: "Wrong1!" },
      dependencies,
    );

    expect(result).toMatchObject({ status: "error", code: "invalid_credentials" });
    expect(dependencies.state.audits).toContainEqual({
      actorUserId: null,
      targetUserId: "user-1",
      type: "failed_login",
      metadata: { username: "duckdev" },
    });
  });

  test("returns current user for a valid session and touches last seen", async () => {
    const dependencies = createFakeDependencies();
    dependencies.state.users.push(createUser({ username: "duckdev" }));
    dependencies.state.sessions.push({
      id: "session-1",
      userId: "user-1",
      tokenVersion: 1,
      expiresAt: new Date("2026-05-30T12:00:00.000Z"),
      revokedAt: null,
      touched: false,
    });

    const result = await getCurrentUserWithDependencies(
      "token:session-1:user-1:duckdev:user:1",
      dependencies,
    );

    expect(result).toEqual({
      userId: "user-1",
      username: "duckdev",
      role: "user",
      sessionId: "session-1",
    });
    expect(dependencies.state.sessions[0]?.touched).toBeTrue();
  });

  test("revokes a valid session on logout", async () => {
    const dependencies = createFakeDependencies();
    dependencies.state.users.push(createUser({ username: "duckdev" }));
    dependencies.state.sessions.push({
      id: "session-1",
      userId: "user-1",
      tokenVersion: 1,
      expiresAt: new Date("2026-05-30T12:00:00.000Z"),
      revokedAt: null,
      touched: false,
    });

    await logoutUserWithDependencies("token:session-1:user-1:duckdev:user:1", dependencies);

    expect(dependencies.state.sessions[0]?.revokedAt).toEqual(new Date("2026-05-23T12:00:00.000Z"));
  });

  test("returns null for missing token", async () => {
    const dependencies = createFakeDependencies();

    const result = await getCurrentUserWithDependencies(undefined, dependencies);

    expect(result).toBeNull();
  });

  test("returns null for invalid token", async () => {
    const dependencies = createFakeDependencies();

    const result = await getCurrentUserWithDependencies("bad-token", dependencies);

    expect(result).toBeNull();
  });

  test("returns null for expired session", async () => {
    const dependencies = createFakeDependencies();
    dependencies.state.users.push(createUser({ username: "duckdev" }));
    dependencies.state.sessions.push({
      id: "session-1",
      userId: "user-1",
      tokenVersion: 1,
      expiresAt: new Date("2026-05-22T12:00:00.000Z"),
      revokedAt: null,
      touched: false,
    });

    const result = await getCurrentUserWithDependencies(
      "token:session-1:user-1:duckdev:user:1",
      dependencies,
    );

    expect(result).toBeNull();
  });

  test("returns null for revoked session", async () => {
    const dependencies = createFakeDependencies();
    dependencies.state.users.push(createUser({ username: "duckdev" }));
    dependencies.state.sessions.push({
      id: "session-1",
      userId: "user-1",
      tokenVersion: 1,
      expiresAt: new Date("2026-05-30T12:00:00.000Z"),
      revokedAt: new Date("2026-05-23T00:00:00.000Z"),
      touched: false,
    });

    const result = await getCurrentUserWithDependencies(
      "token:session-1:user-1:duckdev:user:1",
      dependencies,
    );

    expect(result).toBeNull();
  });

  test("returns null when token version mismatches user version", async () => {
    const dependencies = createFakeDependencies();
    dependencies.state.users.push(createUser({ username: "duckdev", tokenVersion: 2 }));
    dependencies.state.sessions.push({
      id: "session-1",
      userId: "user-1",
      tokenVersion: 1,
      expiresAt: new Date("2026-05-30T12:00:00.000Z"),
      revokedAt: null,
      touched: false,
    });

    const result = await getCurrentUserWithDependencies(
      "token:session-1:user-1:duckdev:user:1",
      dependencies,
    );

    expect(result).toBeNull();
  });

  test("returns null when session belongs to another user — isolation guard", async () => {
    const dependencies = createFakeDependencies();
    // user-1 is "duckdev", user-2 is "attacker"
    dependencies.state.users.push(createUser({ id: "user-1", username: "duckdev" }));
    dependencies.state.users.push(createUser({ id: "user-2", username: "attacker" }));
    // session-1 belongs to user-1 (duckdev)
    dependencies.state.sessions.push({
      id: "session-1",
      userId: "user-1",
      tokenVersion: 1,
      expiresAt: new Date("2026-05-30T12:00:00.000Z"),
      revokedAt: null,
      touched: false,
    });

    // forged token: claims say userId "user-2" (attacker) but session is user-1 (duckdev)
    const result = await getCurrentUserWithDependencies(
      "token:session-1:user-2:attacker:user:1",
      dependencies,
    );

    expect(result).toBeNull();
  });

  test("logout silently no-ops for missing token", async () => {
    const dependencies = createFakeDependencies();

    await logoutUserWithDependencies(undefined, dependencies);

    expect(dependencies.state.sessions).toEqual([]);
  });

  test("logout silently no-ops for invalid token", async () => {
    const dependencies = createFakeDependencies();

    await logoutUserWithDependencies("bad-token", dependencies);

    expect(dependencies.state.sessions).toEqual([]);
  });
});

type FakeSession = {
  id: string;
  userId: string;
  tokenVersion: number;
  expiresAt: Date;
  revokedAt: Date | null;
  touched: boolean;
};

type FakeAudit = {
  actorUserId: string | null;
  targetUserId: string | null;
  type: string;
  metadata: Record<string, string>;
};

type FakeState = {
  users: AuthUserRecord[];
  sessions: FakeSession[];
  audits: FakeAudit[];
  hashInputs: string[];
};

type FakeDependencies = AuthDependencies & { state: FakeState };

function createFakeDependencies(): FakeDependencies {
  const state: FakeState = {
    users: [],
    sessions: [],
    audits: [],
    hashInputs: [],
  };

  return {
    state,
    users: {
      async findByUsername(username: string): Promise<AuthUserRecord | null> {
        return state.users.find((user) => user.username === username) ?? null;
      },
      async findByUsernameOrEmail(
        username: string,
        email: string | null,
      ): Promise<AuthUserRecord | null> {
        return (
          state.users.find(
            (user) => user.username === username || (email && user.email === email),
          ) ?? null
        );
      },
      async createWithAudit(input) {
        const user = createUser({
          id: `user-${state.users.length + 1}`,
          username: input.username,
          email: input.email,
          passwordHash: input.passwordHash,
        });
        state.users.push(user);
        state.audits.push({
          actorUserId: user.id,
          targetUserId: user.id,
          type: "account_register",
          metadata: { username: input.username },
        });
        return { id: user.id, role: user.role, tokenVersion: user.tokenVersion };
      },
    },
    sessions: {
      async create(input) {
        const session = {
          id: `session-${state.sessions.length + 1}`,
          userId: input.userId,
          tokenVersion: input.tokenVersion,
          expiresAt: input.expiresAt,
          revokedAt: null,
          touched: false,
        };
        state.sessions.push(session);
        return { id: session.id };
      },
      async findById(id: string) {
        const session = state.sessions.find((candidate) => candidate.id === id);
        return session
          ? {
              id: session.id,
              userId: session.userId,
              tokenVersion: session.tokenVersion,
              expiresAt: session.expiresAt,
              revokedAt: session.revokedAt,
            }
          : null;
      },
      async revoke(id: string, now: Date): Promise<void> {
        const session = state.sessions.find((candidate) => candidate.id === id);
        if (session) {
          session.revokedAt = now;
        }
      },
      async touch(id: string): Promise<void> {
        const session = state.sessions.find((candidate) => candidate.id === id);
        if (session) {
          session.touched = true;
        }
      },
    },
    auditLog: {
      async record(input: FakeAudit): Promise<void> {
        state.audits.push(input);
      },
    },
    passwordHasher: {
      async hash(password: string): Promise<string> {
        state.hashInputs.push(password);
        return `hashed:${password}`;
      },
      async verify(password: string, hash: string): Promise<boolean> {
        return hash === `hashed:${password}`;
      },
    },
    sessionToken: {
      async sign(claims): Promise<string> {
        return `token:${claims.sessionId}:${claims.userId}:${claims.username}:${claims.role}:${claims.tokenVersion}`;
      },
      async verify(token: string) {
        const parts = token.replace("token:", "").split(":");
        if (parts.length < 5) {
          return null;
        }
        return {
          sessionId: parts[0]!,
          userId: parts[1]!,
          username: parts[2]!,
          role: parts[3]! as "user" | "superadmin",
          tokenVersion: parseInt(parts[4]!, 10),
        };
      },
    },
    clock: {
      now(): Date {
        return new Date("2026-05-23T12:00:00.000Z");
      },
    },
  };
}

function createUser(input: Partial<AuthUserRecord>): AuthUserRecord {
  return {
    id: input.id ?? "user-1",
    username: input.username ?? "duckdev",
    email: input.email ?? null,
    passwordHash: input.passwordHash ?? "hashed:Strong1!",
    role: input.role ?? "user",
    tokenVersion: input.tokenVersion ?? 1,
  };
}
