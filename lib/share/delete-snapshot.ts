import type { DeleteShareSnapshotResult } from "./types";

export async function softDeleteShareSnapshot(
  userId: string,
  publicId: string,
): Promise<DeleteShareSnapshotResult> {
  const { softDeleteShareSnapshotForOwner } = await import("@/lib/db/share-snapshots");
  const result = await softDeleteShareSnapshotForOwner(publicId, userId);

  if (result === "deleted") {
    return { status: "deleted" };
  }

  return { status: "not_found" };
}
