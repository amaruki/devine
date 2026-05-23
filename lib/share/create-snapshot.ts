import { getCurrentShareSnapshotDraft } from "./current-state";
import { createPublicShareId } from "./public-id";
import type { CreateShareSnapshotResult } from "./types";

function getPublicAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function createShareSnapshot(userId: string): Promise<CreateShareSnapshotResult> {
  const draft = getCurrentShareSnapshotDraft();
  const publicId = createPublicShareId();

  const { createShareSnapshotRow } = await import("@/lib/db/share-snapshots");

  await createShareSnapshotRow({
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
    url: `${getPublicAppUrl()}/share/${publicId}`,
  };
}
