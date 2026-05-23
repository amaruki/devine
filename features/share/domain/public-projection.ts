import type { HealthState, SeniorityLevel } from "@/features/scoring";
import type { PublicShareSnapshot } from "../application/types";

export type ShareSnapshotProjectionRow = {
  publicId: string;
  seniorityLevel: string;
  seniorityScore: number;
  healthState: string;
  topTags: string[];
  speechBubble: string;
  generatedAt: Date;
};

const healthStates = ["thriving", "stable", "tired", "sick", "critical", "hibernating"] as const;
const seniorityLevels = [
  "ignorant_copaster",
  "code_monkey",
  "grounded_scholar",
  "tech_philosopher",
] as const;

function isHealthState(value: string): value is HealthState {
  return healthStates.includes(value as HealthState);
}

function isSeniorityLevel(value: string): value is SeniorityLevel {
  return seniorityLevels.includes(value as SeniorityLevel);
}

export function toPublicShareSnapshot(row: ShareSnapshotProjectionRow): PublicShareSnapshot {
  if (!isHealthState(row.healthState) || !isSeniorityLevel(row.seniorityLevel)) {
    throw new Error("Share snapshot contains invalid public state");
  }

  return {
    publicId: row.publicId,
    seniorityLevel: row.seniorityLevel,
    seniorityScore: row.seniorityScore,
    healthState: row.healthState,
    topTags: row.topTags.slice(0, 3),
    speechBubble: row.speechBubble,
    generatedAt: row.generatedAt.toISOString(),
  };
}
