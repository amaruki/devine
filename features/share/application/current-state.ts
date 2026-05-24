import { selectSpeechBubble } from "@/features/speech";
import type { ShareSnapshotDraft } from "./types";

export function getCurrentShareSnapshotDraft(): ShareSnapshotDraft {
  const speechContext = {
    healthState: "stable" as const,
    seniorityLevel: "code_monkey" as const,
    topTags: ["architecture", "ai", "security"],
    energyToday: 42,
    dailyTarget: 50,
  };
  return {
    seniorityLevel: "code_monkey",
    seniorityScore: 42,
    healthState: "stable",
    topTags: ["architecture", "ai", "security"],
    speechBubble: selectSpeechBubble(speechContext),
    generatedAt: new Date(),
  };
}
