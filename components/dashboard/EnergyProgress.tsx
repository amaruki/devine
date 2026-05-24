"use client";

export function EnergyProgress({
  energyToday,
  dailyTarget,
}: {
  energyToday: number;
  dailyTarget: number;
}) {
  const pct = Math.min(100, Math.round((energyToday / dailyTarget) * 100));

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-slate-400">Daily energy</span>
        <span className="text-2xl font-bold tabular-nums">
          {energyToday}
          <span className="text-sm font-normal text-slate-400"> / {dailyTarget}</span>
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      {energyToday >= dailyTarget ? (
        <p className="text-sm text-green-400">Daily target reached. Your duck is happy.</p>
      ) : energyToday > 0 ? (
        <p className="text-sm text-slate-400">
          {dailyTarget - energyToday} more energy to reach today&rsquo;s target.
        </p>
      ) : (
        <p className="text-sm text-slate-500">Start interacting to earn energy for your duck.</p>
      )}
    </div>
  );
}
