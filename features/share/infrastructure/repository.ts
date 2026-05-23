import type { CreateShareSnapshotInput, ShareSnapshotRepository } from "../application/ports";

export const shareSnapshotRepository: ShareSnapshotRepository = {
  async create(input: CreateShareSnapshotInput): Promise<void> {
    const { createShareSnapshotRow } = await import("@/lib/db/share-snapshots");
    await createShareSnapshotRow(input);
  },

  async findByPublicId(publicId: string) {
    const { findShareSnapshotByPublicId } = await import("@/lib/db/share-snapshots");
    return findShareSnapshotByPublicId(publicId);
  },

  async softDeleteForOwner(publicId: string, userId: string) {
    const { softDeleteShareSnapshotForOwner } = await import("@/lib/db/share-snapshots");
    return softDeleteShareSnapshotForOwner(publicId, userId);
  },
};
