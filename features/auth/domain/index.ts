import { z } from "zod";

const reservedUsernames = new Set([
  "admin",
  "api",
  "auth",
  "dashboard",
  "settings",
  "share",
  "demo",
  "support",
  "root",
  "system",
]);

const usernamePattern = /^[a-z0-9][a-z0-9_]{2,23}$/;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const emailSchema = z.email();

export const sessionCookieName = "devine_session";
export const sessionDurationSeconds = 60 * 60 * 24 * 7;

export type UserRole = "user" | "superadmin";

export type AuthContext = {
  userId: string;
  username: string;
  role: UserRole;
  sessionId: string;
};

export type AuthErrorCode =
  | "invalid_username"
  | "reserved_username"
  | "weak_password"
  | "invalid_email"
  | "username_taken"
  | "email_taken"
  | "invalid_credentials"
  | "service_unavailable";

export type RegisterUserInput = {
  username: string;
  password: string;
  email?: string;
  timezone?: string;
};

export type LoginInput = {
  username: string;
  password: string;
};

export type UnsignedSessionClaims = {
  userId: string;
  username: string;
  role: UserRole;
  sessionId: string;
  tokenVersion: number;
};

export type SessionClaims = UnsignedSessionClaims & {
  iat?: number;
  exp?: number;
};

export type AuthSuccess = {
  status: "ok";
  context: AuthContext;
  sessionToken: string;
  expiresAt: Date;
  redirectTo: "/dashboard";
};

export type AuthResult =
  | AuthSuccess
  | {
      status: "error";
      code: AuthErrorCode;
      message: string;
    };

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

export function validateUsername(username: string): AuthErrorCode | null {
  const normalized = normalizeUsername(username);
  if (!usernamePattern.test(normalized)) {
    return "invalid_username";
  }
  if (reservedUsernames.has(normalized)) {
    return "reserved_username";
  }
  return null;
}

export function validatePassword(password: string): boolean {
  return passwordPattern.test(password);
}

export function normalizeEmail(
  email: string | undefined,
): { status: "ok"; email: string | null } | { status: "error" } {
  const trimmed = email?.trim();
  if (!trimmed) {
    return { status: "ok", email: null };
  }
  const normalized = trimmed.toLowerCase();
  if (!emailSchema.safeParse(normalized).success) {
    return { status: "error" };
  }
  return { status: "ok", email: normalized };
}

export function authError(code: AuthErrorCode): AuthResult {
  const messages: Record<AuthErrorCode, string> = {
    invalid_username:
      "Use 3 to 24 letters, numbers, or underscores, starting with a letter or number.",
    reserved_username: "That username is reserved for Devine routes and support use.",
    weak_password:
      "Use at least 8 characters with uppercase, lowercase, number, and symbol characters.",
    invalid_email: "Enter a valid email address or leave email blank.",
    username_taken: "That username is already taken.",
    email_taken: "That email is already attached to an account.",
    invalid_credentials: "Username or password is incorrect.",
    service_unavailable: "Authentication is temporarily unavailable.",
  };
  return { status: "error", code, message: messages[code] };
}

export function isUserRole(role: unknown): role is UserRole {
  return role === "user" || role === "superadmin";
}
