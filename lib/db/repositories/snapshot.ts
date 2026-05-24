import { and, eq } from "drizzle-orm";
import { db } from "../client";
import { dailyPetSnapshots } from "../schema";

export type DailyPetSnapshotRow = typeof dailyPetSnapshots.$inferSelect;

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
