import { eq, or } from "drizzle-orm";
import type {
  AuthAuditLog,
  AuthSessionRepository,
  AuthUserRecord,
  AuthUserRepository,
  CreateAuthUserInput,
  CreatedAuthUser,
} from "@/features/auth/application/ports";
import { db } from "../client";
import { auditEvents, sessions, users } from "../schema";

export const authUserRepository: AuthUserRepository = {
  async findByUsername(username: string): Promise<AuthUserRecord | null> {
    const user = await db.query.users.findFirst({ where: eq(users.username, username) });
    return toAuthUserRecord(user);
  },

  async findByUsernameOrEmail(
    username: string,
    email: string | null,
  ): Promise<AuthUserRecord | null> {
    const user = email
      ? await db.query.users.findFirst({
          where: or(eq(users.username, username), eq(users.email, email)),
        })
      : await db.query.users.findFirst({ where: eq(users.username, username) });
    return toAuthUserRecord(user);
  },

  async createWithAudit(input: CreateAuthUserInput): Promise<CreatedAuthUser | null> {
    return db.transaction(async (tx) => {
      const createdUsers = await tx
        .insert(users)
        .values({
          username: input.username,
          displayUsername: input.displayUsername,
          email: input.email,
          passwordHash: input.passwordHash,
          timezone: input.timezone,
        })
        .returning({
          id: users.id,
          role: users.role,
          tokenVersion: users.tokenVersion,
        });
      const createdUser = createdUsers[0];
      if (!createdUser || (createdUser.role !== "user" && createdUser.role !== "superadmin")) {
        return null;
      }
      await tx.insert(auditEvents).values({
        actorUserId: createdUser.id,
        targetUserId: createdUser.id,
        type: "account_register",
        metadata: { username: input.username },
      });
      return {
        id: createdUser.id,
        role: createdUser.role,
        tokenVersion: createdUser.tokenVersion,
      };
    });
  },
};

export const authSessionRepository: AuthSessionRepository = {
  async create(input: {
    userId: string;
    tokenVersion: number;
    expiresAt: Date;
    now: Date;
  }): Promise<{ id: string } | null> {
    const createdSessions = await db
      .insert(sessions)
      .values({
        userId: input.userId,
        tokenVersion: input.tokenVersion,
        expiresAt: input.expiresAt,
        lastSeenAt: input.now,
      })
      .returning({ id: sessions.id });
    return createdSessions[0] ?? null;
  },

  async findById(id: string) {
    const session = await db.query.sessions.findFirst({ where: eq(sessions.id, id) });
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
    await db.update(sessions).set({ revokedAt: now }).where(eq(sessions.id, id));
  },

  async touch(id: string, now: Date): Promise<void> {
    await db.update(sessions).set({ lastSeenAt: now }).where(eq(sessions.id, id));
  },
};

export const authAuditLog: AuthAuditLog = {
  async record(input: {
    actorUserId: string | null;
    targetUserId: string | null;
    type: string;
    metadata: Record<string, string>;
  }): Promise<void> {
    await db.insert(auditEvents).values(input);
  },
};

type DbAuthUserRecord = typeof users.$inferSelect;

function toAuthUserRecord(user: DbAuthUserRecord | undefined): AuthUserRecord | null {
  if (!user || (user.role !== "user" && user.role !== "superadmin")) {
    return null;
  }
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    passwordHash: user.passwordHash,
    role: user.role,
    tokenVersion: user.tokenVersion,
  };
}
