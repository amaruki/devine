import { eq } from "drizzle-orm";
import { db } from "../client";
import { auditEvents, demoStates, users } from "../schema";

export async function updateUserPersona(userId: string, persona: string): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.update(users).set({ persona, updatedAt: new Date() }).where(eq(users.id, userId));
    await tx
      .insert(demoStates)
      .values({ userId, persona })
      .onConflictDoUpdate({
        target: demoStates.userId,
        set: { persona, resetAt: new Date(), updatedAt: new Date() },
      });
  });
}

export async function getUserPersona(userId: string): Promise<string | null> {
  const row = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { persona: true },
  });
  return row?.persona ?? null;
}

export async function upsertDemoState(
  userId: string,
  persona: string,
  state: Record<string, unknown> = {},
): Promise<void> {
  await db
    .insert(demoStates)
    .values({ userId, persona, state })
    .onConflictDoUpdate({
      target: demoStates.userId,
      set: { persona, state, updatedAt: new Date() },
    });
}

export async function getDemoState(userId: string): Promise<typeof demoStates.$inferSelect | null> {
  const row = await db.query.demoStates.findFirst({
    where: eq(demoStates.userId, userId),
  });
  return row ?? null;
}

export async function resetDemoStateForUser(userId: string, persona: string): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.update(users).set({ persona, updatedAt: new Date() }).where(eq(users.id, userId));
    await tx
      .insert(demoStates)
      .values({ userId, persona, resetAt: new Date(), state: { path: "judge" } })
      .onConflictDoUpdate({
        target: demoStates.userId,
        set: { persona, resetAt: new Date(), state: { path: "judge" }, updatedAt: new Date() },
      });
  });
}

export async function isJudgeAccount(userId: string): Promise<boolean> {
  const row = await db.query.demoStates.findFirst({
    where: eq(demoStates.userId, userId),
    columns: { state: true },
  });
  return (
    row?.state != null &&
    typeof row.state === "object" &&
    (row.state as Record<string, unknown>).path === "judge"
  );
}

export async function findUserByUsername(
  username: string,
): Promise<{ id: string; username: string } | null> {
  const row = await db.query.users.findFirst({
    where: eq(users.username, username),
    columns: { id: true, username: true },
  });
  return row ?? null;
}

export async function insertAuditEvent(input: {
  actorUserId: string | null;
  targetUserId: string | null;
  type: string;
  metadata: Record<string, string>;
}): Promise<void> {
  await db.insert(auditEvents).values(input);
}
