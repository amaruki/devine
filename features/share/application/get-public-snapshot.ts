import { toPublicShareSnapshot } from "../domain/public-projection";
import type { ShareDependencies } from "./ports";
import type { GetPublicShareSnapshotResult } from "./types";

export async function getPublicShareSnapshotWithDependencies(
  publicId: string,
  dependencies: ShareDependencies,
): Promise<GetPublicShareSnapshotResult> {
  const row = await dependencies.snapshots.findByPublicId(publicId);

  if (!row) {
    return { status: "not_found" };
  }

  if (row.deletedAt) {
    return { status: "deleted" };
  }

  return { status: "ok", snapshot: toPublicShareSnapshot(row) };
}
