import { toPublicShareSnapshot } from "./public-projection";
import type { GetPublicShareSnapshotResult } from "./types";

export async function getPublicShareSnapshot(
  publicId: string,
): Promise<GetPublicShareSnapshotResult> {
  const { findShareSnapshotByPublicId } = await import("@/lib/db/share-snapshots");
  const row = await findShareSnapshotByPublicId(publicId);

  if (!row) {
    return { status: "not_found" };
  }

  if (row.deletedAt) {
    return { status: "deleted" };
  }

  return { status: "ok", snapshot: toPublicShareSnapshot(row) };
}
