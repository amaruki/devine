import { createPublicShareId } from "../domain/public-id";
import { buildShareSnapshotDraft, type UserSnapshotState } from "./current-state";
import type { ShareDependencies } from "./ports";
import type { CreateShareSnapshotResult } from "./types";

export async function createShareSnapshotWithDependencies(
  userId: string,
  state: UserSnapshotState,
  dependencies: ShareDependencies,
): Promise<CreateShareSnapshotResult> {
  const draft = buildShareSnapshotDraft(state);
  const publicId = createPublicShareId();

  await dependencies.snapshots.create({
    publicId,
    userId,
    dailyPetSnapshotId: null,
    seniorityLevel: draft.seniorityLevel,
    seniorityScore: draft.seniorityScore,
    healthState: draft.healthState,
    topTags: draft.topTags,
    speechBubble: draft.speechBubble,
    generatedAt: draft.generatedAt,
  });

  return {
    status: "ok",
    publicId,
    url: `${dependencies.getPublicAppUrl()}/share/${publicId}`,
  };
}
