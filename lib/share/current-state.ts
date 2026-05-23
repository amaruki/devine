import { selectSpeechBubble } from "@/lib/speech";
import type { ShareSnapshotDraft } from "./types";

export function getCurrentShareSnapshotDraft(): ShareSnapshotDraft {
  return {
    seniorityLevel: "code_monkey",
    seniorityScore: 42,
    healthState: "stable",
    topTags: ["architecture", "ai", "security"],
    speechBubble: selectSpeechBubble(),
    generatedAt: new Date(),
  };
}
