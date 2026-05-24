export type HealthState = "thriving" | "stable" | "tired" | "sick" | "critical" | "hibernating";
export type SeniorityLevel =
  | "ignorant_copaster"
  | "code_monkey"
  | "grounded_scholar"
  | "tech_philosopher";

export {
  applyHealthChange,
  calculateDailyEnergy,
  calculateSeniorityScore,
  computeHealthFromEvents,
  DAILY_CAPS,
  DAILY_TARGET,
  DEEP_TECH_TAGS,
  determineHealthChange,
  ENERGY_VALUES,
  healthToState,
  normalizeTag,
  processMissedDays,
  scoreToLevel,
} from "./domain";
export type {
  EnergyByType,
  EnergyResult,
  HealthResult,
  MissedDayResult,
  ScoreBreakdown,
  SeniorityResult,
} from "./domain";
export { computeDailySnapshot } from "./application";
export type { ComputeDailySnapshotInput, ComputeDailySnapshotResult } from "./application";
