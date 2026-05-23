import {
  authAuditLog,
  authSessionRepository,
  authUserRepository,
} from "@/lib/db/repositories/auth";
import type { AuthContext, AuthResult, LoginInput, RegisterUserInput } from "./domain";
import { getAuthRuntimeConfig } from "./infrastructure/auth-config";
import { bunPasswordHasher } from "./infrastructure/bun-password";
import { createJoseSessionTokenService } from "./infrastructure/jose-session-token";
import type { AuthDependencies } from "./ports";
import {
  getCurrentUserWithDependencies,
  loginUserWithDependencies,
  logoutUserWithDependencies,
  registerUserWithDependencies,
} from "./use-cases";

const clock = {
  now(): Date {
    return new Date();
  },
};

export async function registerUser(input: RegisterUserInput): Promise<AuthResult> {
  return registerUserWithDependencies(input, createAuthDependencies());
}

export async function loginUser(input: LoginInput): Promise<AuthResult> {
  return loginUserWithDependencies(input, createAuthDependencies());
}

export async function getCurrentUser(
  sessionToken: string | undefined,
): Promise<AuthContext | null> {
  return getCurrentUserWithDependencies(sessionToken, createAuthDependencies());
}

export async function logoutUser(sessionToken: string | undefined): Promise<void> {
  await logoutUserWithDependencies(sessionToken, createAuthDependencies());
}

export function isSecureSessionCookie(): boolean {
  return getAuthRuntimeConfig().secureCookies;
}

function createAuthDependencies(): AuthDependencies {
  const config = getAuthRuntimeConfig();
  return {
    users: authUserRepository,
    sessions: authSessionRepository,
    auditLog: authAuditLog,
    passwordHasher: bunPasswordHasher,
    sessionToken: createJoseSessionTokenService(config.sessionSecret),
    clock,
  };
}
