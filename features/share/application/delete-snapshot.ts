import type { ShareDependencies } from "./ports";
import type { DeleteShareSnapshotResult } from "./types";

export async function softDeleteShareSnapshotWithDependencies(
  userId: string,
  publicId: string,
  dependencies: ShareDependencies,
): Promise<DeleteShareSnapshotResult> {
  const result = await dependencies.snapshots.softDeleteForOwner(publicId, userId);

  if (result === "deleted") {
    return { status: "deleted" };
  }

  return { status: "not_found" };
}
