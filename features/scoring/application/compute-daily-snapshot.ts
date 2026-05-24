import {
  calculateDailyEnergy,
  calculateSeniorityScore,
  computeHealthFromEvents,
  processMissedDays,
} from "../domain";
import type { ScoreBreakdown, SeniorityLevel } from "@/features/scoring";

export type ComputeDailySnapshotInput = {
  todayEvents: { type: string; energyEarned: number; tags: string[]; occurredAt: Date }[];
  sevenDayEvents: { type: string; tags: string[]; occurredAt: Date }[];
  previousHealth: number;
  lastSnapshotDate: Date | null;
  today: Date;
};

export type ComputeDailySnapshotResult = {
  energyEarned: number;
  health: number;
  healthState: string;
  seniorityScore: number;
  seniorityLevel: SeniorityLevel;
  scoreBreakdown: ScoreBreakdown;
};

export function computeDailySnapshot(input: ComputeDailySnapshotInput): ComputeDailySnapshotResult {
  const energy = calculateDailyEnergy(input.todayEvents);

  const afterMissedDays = processMissedDays(
    input.previousHealth,
    input.lastSnapshotDate,
    input.today,
  );
  const health = computeHealthFromEvents(afterMissedDays.health, energy.total);
  const seniority = calculateSeniorityScore(input.sevenDayEvents);

  return {
    energyEarned: energy.total,
    health: health.health,
    healthState: health.healthState,
    seniorityScore: seniority.score,
    seniorityLevel: seniority.level,
    scoreBreakdown: seniority.breakdown,
  };
}
