import type { ShareSnapshotProjectionRow } from "../domain/public-projection";
import type { ShareSnapshotDraft } from "./types";

export type CreateShareSnapshotInput = ShareSnapshotDraft & {
  publicId: string;
  userId: string;
  dailyPetSnapshotId: string | null;
};

export type ShareSnapshotRecord = ShareSnapshotProjectionRow & {
  deletedAt: Date | null;
};

export type ShareSnapshotRepository = {
  create(input: CreateShareSnapshotInput): Promise<void>;
  findByPublicId(publicId: string): Promise<ShareSnapshotRecord | null>;
  softDeleteForOwner(publicId: string, userId: string): Promise<"deleted" | "not_found">;
};

export type ShareDependencies = {
  snapshots: ShareSnapshotRepository;
  getPublicAppUrl(): string;
};
