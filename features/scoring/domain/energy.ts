import type { ActivityType } from "@/features/activity";

export const ENERGY_VALUES: Record<ActivityType, number> = {
  read: 10,
  upvote: 3,
  bookmark: 5,
  comment: 15,
  share: 12,
};

export const DAILY_CAPS: Record<ActivityType, number> = {
  read: 5,
  upvote: 10,
  bookmark: 5,
  comment: 3,
  share: 3,
};

export const DAILY_TARGET = 50;

export type EnergyByType = Record<ActivityType, number>;

export type EnergyResult = {
  total: number;
  byType: EnergyByType;
  capped: boolean;
};

export function calculateDailyEnergy(
  events: { type: string; energyEarned: number }[],
): EnergyResult {
  const byType: EnergyByType = { read: 0, upvote: 0, bookmark: 0, comment: 0, share: 0 };
  let capped = false;

  for (const event of events) {
    const type = event.type as ActivityType;
    if (type in byType) {
      byType[type] += event.energyEarned;
    }
  }

  // Apply daily caps per type
  for (const type of Object.keys(DAILY_CAPS) as ActivityType[]) {
    if (byType[type] > DAILY_CAPS[type] * ENERGY_VALUES[type]) {
      byType[type] = DAILY_CAPS[type] * ENERGY_VALUES[type];
      capped = true;
    }
  }

  const total = Object.values(byType).reduce((sum, v) => sum + v, 0);
  return { total, byType, capped };
}
