export type MissedDayResult = {
  health: number;
  missedDays: number;
};

export function processMissedDays(
  previousHealth: number,
  lastSnapshotDate: Date | null,
  today: Date,
): MissedDayResult {
  if (lastSnapshotDate === null) {
    // New user with no snapshots — nothing to decay
    return { health: previousHealth, missedDays: 0 };
  }

  const todayStartMs = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const lastSnapshotStartMs = Date.UTC(
    lastSnapshotDate.getUTCFullYear(),
    lastSnapshotDate.getUTCMonth(),
    lastSnapshotDate.getUTCDate(),
  );

  // Days since the last snapshot date (not including today)
  const dayMs = 24 * 60 * 60 * 1000;
  const daysElapsed = Math.floor((todayStartMs - lastSnapshotStartMs) / dayMs);

  // 0 or 1 day since last snapshot = no missed days. >1 means missed days in between.
  const missedDays = Math.max(0, daysElapsed - 1);

  // -20 health per missed day, clamped at 0
  const health = Math.max(0, previousHealth - missedDays * 20);

  return { health, missedDays };
}
