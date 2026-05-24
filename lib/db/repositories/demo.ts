import { eq } from "drizzle-orm";
import { db } from "../client";
import { users } from "../schema";

export async function updateUserPersona(userId: string, persona: string): Promise<void> {
  await db.update(users).set({ persona, updatedAt: new Date() }).where(eq(users.id, userId));
}

export async function getUserPersona(userId: string): Promise<string | null> {
  const row = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { persona: true },
  });
  return row?.persona ?? null;
}
