import { createShareSnapshotWithDependencies } from "../application/create-snapshot";
import { softDeleteShareSnapshotWithDependencies } from "../application/delete-snapshot";
import { getPublicShareSnapshotWithDependencies } from "../application/get-public-snapshot";
import type { ShareDependencies, UserSnapshotState } from "../application/ports";
import type {
  CreateShareSnapshotResult,
  DeleteShareSnapshotResult,
  GetPublicShareSnapshotResult,
} from "../application/types";
import { shareSnapshotRepository } from "./repository";

export async function createShareSnapshot(
  userId: string,
  state: UserSnapshotState,
): Promise<CreateShareSnapshotResult> {
  return createShareSnapshotWithDependencies(userId, state, createShareDependencies());
}

export async function getPublicShareSnapshot(
  publicId: string,
): Promise<GetPublicShareSnapshotResult> {
  return getPublicShareSnapshotWithDependencies(publicId, createShareDependencies());
}

export async function softDeleteShareSnapshot(
  userId: string,
  publicId: string,
): Promise<DeleteShareSnapshotResult> {
  return softDeleteShareSnapshotWithDependencies(userId, publicId, createShareDependencies());
}

function createShareDependencies(): ShareDependencies {
  return {
    snapshots: shareSnapshotRepository,
    getPublicAppUrl(): string {
      return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    },
  };
}
