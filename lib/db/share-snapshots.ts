import { and, eq, isNull } from "drizzle-orm";
import { db } from "./client";
import { shareSnapshots } from "./schema";

export type ShareSnapshotRow = typeof shareSnapshots.$inferSelect;
export type CreateShareSnapshotRowInput = typeof shareSnapshots.$inferInsert;

export async function createShareSnapshotRow(
  input: CreateShareSnapshotRowInput,
): Promise<ShareSnapshotRow> {
  const [row] = await db.insert(shareSnapshots).values(input).returning();

  if (!row) {
    throw new Error("Share snapshot insert did not return a row");
  }

  return row;
}

export async function findShareSnapshotByPublicId(
  publicId: string,
): Promise<ShareSnapshotRow | null> {
  const [row] = await db
    .select()
    .from(shareSnapshots)
    .where(eq(shareSnapshots.publicId, publicId))
    .limit(1);

  return row ?? null;
}

export async function findActiveShareSnapshotByPublicId(
  publicId: string,
): Promise<ShareSnapshotRow | null> {
  const [row] = await db
    .select()
    .from(shareSnapshots)
    .where(and(eq(shareSnapshots.publicId, publicId), isNull(shareSnapshots.deletedAt)))
    .limit(1);

  return row ?? null;
}

export async function softDeleteShareSnapshotForOwner(
  publicId: string,
  userId: string,
): Promise<"deleted" | "not_found"> {
  const [row] = await db
    .update(shareSnapshots)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(
      and(
        eq(shareSnapshots.publicId, publicId),
        eq(shareSnapshots.userId, userId),
        isNull(shareSnapshots.deletedAt),
      ),
    )
    .returning({ id: shareSnapshots.id });

  return row ? "deleted" : "not_found";
}
