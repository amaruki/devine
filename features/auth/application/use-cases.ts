import {
  authError,
  isUserRole,
  normalizeEmail,
  normalizeUsername,
  sessionDurationSeconds,
  validatePassword,
  validateUsername,
  type AuthContext,
  type AuthResult,
  type LoginInput,
  type RegisterUserInput,
  type SessionClaims,
} from "../domain";
import type { AuthDependencies } from "./ports";

export async function registerUserWithDependencies(
  input: RegisterUserInput,
  dependencies: AuthDependencies,
): Promise<AuthResult> {
  const username = normalizeUsername(input.username);
  const usernameError = validateUsername(input.username);
  if (usernameError) {
    return authError(usernameError);
  }
  if (!validatePassword(input.password)) {
    return authError("weak_password");
  }
  const email = normalizeEmail(input.email);
  if (email.status === "error") {
    return authError("invalid_email");
  }

  const existingUser = await dependencies.users.findByUsernameOrEmail(username, email.email);
  if (existingUser?.username === username) {
    return authError("username_taken");
  }
  if (email.email && existingUser?.email === email.email) {
    return authError("email_taken");
  }

  const passwordHash = await dependencies.passwordHasher.hash(input.password);
  const createdUser = await dependencies.users.createWithAudit({
    username,
    displayUsername: input.username.trim(),
    email: email.email,
    passwordHash,
    timezone: input.timezone ?? "UTC",
  });
  if (!createdUser || !isUserRole(createdUser.role)) {
    return authError("service_unavailable");
  }

  return createAuthenticatedSession(
    {
      userId: createdUser.id,
      username,
      role: createdUser.role,
      tokenVersion: createdUser.tokenVersion,
    },
    dependencies,
  );
}

export async function loginUserWithDependencies(
  input: LoginInput,
  dependencies: AuthDependencies,
): Promise<AuthResult> {
  const username = normalizeUsername(input.username);
  const existingUser = await dependencies.users.findByUsername(username);
  if (
    !existingUser ||
    !(await dependencies.passwordHasher.verify(input.password, existingUser.passwordHash))
  ) {
    await dependencies.auditLog.record({
      actorUserId: null,
      targetUserId: existingUser?.id ?? null,
      type: "failed_login",
      metadata: { username },
    });
    return authError("invalid_credentials");
  }

  await dependencies.auditLog.record({
    actorUserId: existingUser.id,
    targetUserId: existingUser.id,
    type: "login_success",
    metadata: { username: existingUser.username },
  });
  return createAuthenticatedSession(
    {
      userId: existingUser.id,
      username: existingUser.username,
      role: existingUser.role,
      tokenVersion: existingUser.tokenVersion,
    },
    dependencies,
  );
}

export async function getCurrentUserWithDependencies(
  token: string | undefined,
  dependencies: AuthDependencies,
): Promise<AuthContext | null> {
  if (!token) {
    return null;
  }
  const claims = await dependencies.sessionToken.verify(token);
  if (!claims) {
    return null;
  }

  const session = await dependencies.sessions.findById(claims.sessionId);
  const user = await dependencies.users.findByUsername(claims.username);
  const now = dependencies.clock.now();
  if (!session || !user || session.revokedAt || session.expiresAt <= now) {
    return null;
  }
  if (
    session.userId !== user.id ||
    session.tokenVersion !== user.tokenVersion ||
    claims.tokenVersion !== user.tokenVersion
  ) {
    return null;
  }

  await dependencies.sessions.touch(session.id, now);
  return {
    userId: user.id,
    username: user.username,
    role: user.role,
    sessionId: session.id,
  };
}

export async function logoutUserWithDependencies(
  token: string | undefined,
  dependencies: AuthDependencies,
): Promise<void> {
  if (!token) {
    return;
  }
  const claims = await dependencies.sessionToken.verify(token);
  if (!claims) {
    return;
  }
  await dependencies.sessions.revoke(claims.sessionId, dependencies.clock.now());
}

async function createAuthenticatedSession(
  input: Omit<SessionClaims, "sessionId" | "iat" | "exp">,
  dependencies: AuthDependencies,
): Promise<AuthResult> {
  const now = dependencies.clock.now();
  const expiresAt = new Date(now.getTime() + sessionDurationSeconds * 1000);
  const session = await dependencies.sessions.create({
    userId: input.userId,
    tokenVersion: input.tokenVersion,
    expiresAt,
    now,
  });
  if (!session) {
    return authError("service_unavailable");
  }

  const context: AuthContext = {
    userId: input.userId,
    username: input.username,
    role: input.role,
    sessionId: session.id,
  };
  const sessionToken = await dependencies.sessionToken.sign(
    {
      userId: input.userId,
      username: input.username,
      role: input.role,
      sessionId: session.id,
      tokenVersion: input.tokenVersion,
    },
    expiresAt,
  );

  return { status: "ok", context, sessionToken, expiresAt, redirectTo: "/dashboard" };
}
