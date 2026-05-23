import type { AuthContext, AuthResult, LoginInput, RegisterUserInput } from "../domain";
import type { AuthDependencies } from "../application/ports";
import {
  getCurrentUserWithDependencies,
  loginUserWithDependencies,
  logoutUserWithDependencies,
  registerUserWithDependencies,
} from "../application/use-cases";
import { getAuthRuntimeConfig } from "./auth-config";
import { bunPasswordHasher } from "./bun-password";
import { createJoseSessionTokenService } from "./jose-session-token";

const clock = {
  now(): Date {
    return new Date();
  },
};

export async function registerUser(input: RegisterUserInput): Promise<AuthResult> {
  return registerUserWithDependencies(input, await createAuthDependencies());
}

export async function loginUser(input: LoginInput): Promise<AuthResult> {
  return loginUserWithDependencies(input, await createAuthDependencies());
}

export async function getCurrentUser(
  sessionToken: string | undefined,
): Promise<AuthContext | null> {
  return getCurrentUserWithDependencies(sessionToken, await createAuthDependencies());
}

export async function logoutUser(sessionToken: string | undefined): Promise<void> {
  await logoutUserWithDependencies(sessionToken, await createAuthDependencies());
}

export function isSecureSessionCookie(): boolean {
  return getAuthRuntimeConfig().secureCookies;
}

async function createAuthDependencies(): Promise<AuthDependencies> {
  const [{ authAuditLog, authSessionRepository, authUserRepository }, config] = await Promise.all([
    import("@/lib/db/repositories/auth"),
    Promise.resolve(getAuthRuntimeConfig()),
  ]);
  return {
    users: authUserRepository,
    sessions: authSessionRepository,
    auditLog: authAuditLog,
    passwordHasher: bunPasswordHasher,
    sessionToken: createJoseSessionTokenService(config.sessionSecret),
    clock,
  };
}
