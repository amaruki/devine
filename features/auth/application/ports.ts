import type { SessionClaims, UnsignedSessionClaims, UserRole } from "../domain";

export type AuthUserRecord = {
  id: string;
  username: string;
  email: string | null;
  passwordHash: string;
  role: UserRole;
  tokenVersion: number;
};

export type CreatedAuthUser = {
  id: string;
  role: UserRole;
  tokenVersion: number;
};

export type CreateAuthUserInput = {
  username: string;
  displayUsername: string;
  email: string | null;
  passwordHash: string;
  timezone: string;
};

export type AuthSessionRecord = {
  id: string;
  userId: string;
  tokenVersion: number;
  expiresAt: Date;
  revokedAt: Date | null;
};

export type AuthUserRepository = {
  findByUsername(username: string): Promise<AuthUserRecord | null>;
  findByUsernameOrEmail(username: string, email: string | null): Promise<AuthUserRecord | null>;
  createWithAudit(input: CreateAuthUserInput): Promise<CreatedAuthUser | null>;
};

export type AuthSessionRepository = {
  create(input: {
    userId: string;
    tokenVersion: number;
    expiresAt: Date;
    now: Date;
  }): Promise<{ id: string } | null>;
  findById(id: string): Promise<AuthSessionRecord | null>;
  revoke(id: string, now: Date): Promise<void>;
  touch(id: string, now: Date): Promise<void>;
};

export type AuthAuditLog = {
  record(input: {
    actorUserId: string | null;
    targetUserId: string | null;
    type: string;
    metadata: Record<string, string>;
  }): Promise<void>;
};

export type PasswordHasher = {
  hash(password: string): Promise<string>;
  verify(password: string, hash: string): Promise<boolean>;
};

export type SessionTokenService = {
  sign(claims: UnsignedSessionClaims, expiresAt: Date): Promise<string>;
  verify(token: string): Promise<SessionClaims | null>;
};

export type Clock = {
  now(): Date;
};

export type AuthDependencies = {
  users: AuthUserRepository;
  sessions: AuthSessionRepository;
  auditLog: AuthAuditLog;
  passwordHasher: PasswordHasher;
  sessionToken: SessionTokenService;
  clock: Clock;
};
