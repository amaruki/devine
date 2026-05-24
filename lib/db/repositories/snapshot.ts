import { and, eq } from "drizzle-orm";
import { db } from "../client";
import { dailyPetSnapshots } from "../schema";

export type DailyPetSnapshotRow = typeof dailyPetSnapshots.$inferSelect;
export type DailyPetSnapshotDraft = typeof dailyPetSnapshots.$inferInsert;

export async function findLatestSnapshotByUser(
  userId: string,
): Promise<DailyPetSnapshotRow | null> {
  const rows = await db.query.dailyPetSnapshots.findMany({
    where: eq(dailyPetSnapshots.userId, userId),
    orderBy: (snapshots, { desc }) => [desc(snapshots.date)],
    limit: 1,
  });
  return rows[0] ?? null;
}

export async function findSnapshotByUserAndDate(
  userId: string,
  date: string,
): Promise<DailyPetSnapshotRow | null> {
  return (
    (await db.query.dailyPetSnapshots.findFirst({
      where: and(eq(dailyPetSnapshots.userId, userId), eq(dailyPetSnapshots.date, date)),
    })) ?? null
  );
}

export async function upsertDailySnapshot(
  snapshot: Omit<DailyPetSnapshotDraft, "id" | "createdAt" | "updatedAt">,
): Promise<DailyPetSnapshotRow> {
  const rows = await db
    .insert(dailyPetSnapshots)
    .values({
      ...snapshot,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [dailyPetSnapshots.userId, dailyPetSnapshots.date],
      set: {
        energyEarned: snapshot.energyEarned,
        health: snapshot.health,
        healthState: snapshot.healthState,
        seniorityScore: snapshot.seniorityScore,
        seniorityLevel: snapshot.seniorityLevel,
        scoreBreakdown: snapshot.scoreBreakdown,
        completedQuests: snapshot.completedQuests,
        powerUpsEarned: snapshot.powerUpsEarned,
        updatedAt: new Date(),
      },
    })
    .returning();

  const row = rows[0];
  if (!row) throw new Error("Failed to upsert daily snapshot");
  return row;
}
