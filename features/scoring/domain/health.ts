import type { HealthState } from "@/features/scoring";

export type HealthResult = {
  health: number;
  healthState: HealthState;
  delta: number;
};

export function determineHealthChange(dailyEnergy: number): number {
  if (dailyEnergy >= 50) return 5;
  if (dailyEnergy >= 30) return 0;
  if (dailyEnergy >= 10) return -8;
  if (dailyEnergy >= 1) return -12;
  return -20;
}

export function applyHealthChange(previousHealth: number, delta: number): HealthResult {
  const health = Math.max(0, Math.min(100, previousHealth + delta));
  const healthState = healthToState(health);
  return { health, healthState, delta };
}

export function healthToState(health: number): HealthState {
  if (health >= 80) return "thriving";
  if (health >= 60) return "stable";
  if (health >= 40) return "tired";
  if (health >= 20) return "sick";
  if (health >= 1) return "critical";
  return "hibernating";
}

export function computeHealthFromEvents(previousHealth: number, dailyEnergy: number): HealthResult {
  const delta = determineHealthChange(dailyEnergy);
  return applyHealthChange(previousHealth, delta);
}
