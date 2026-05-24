import { selectSpeechBubble } from "@/features/speech";
import type { ShareSnapshotDraft, UserSnapshotState } from "./types";

export { type UserSnapshotState } from "./types";

export function buildShareSnapshotDraft(state: UserSnapshotState): ShareSnapshotDraft {
  const speechContext = {
    healthState: state.healthState,
    seniorityLevel: state.seniorityLevel,
    topTags: state.topTags,
    energyToday: state.energyToday,
    dailyTarget: state.dailyTarget,
  };
  return {
    seniorityLevel: state.seniorityLevel,
    seniorityScore: state.seniorityScore,
    healthState: state.healthState,
    topTags: state.topTags,
    speechBubble: selectSpeechBubble(speechContext),
    generatedAt: new Date(),
  };
}
