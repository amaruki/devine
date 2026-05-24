import { DuckAvatar } from "@/components/duck/DuckAvatar";
import { EnergyProgress } from "@/components/dashboard/EnergyProgress";
import { DemoActions } from "@/components/dashboard/DemoActions";
import { DuckSpeechBubble } from "@/components/duck/DuckSpeechBubble";
import { logoutAccount } from "../auth/actions";
import { requireUser } from "../auth/require-user";
import { calculateDailyEnergy, computeDailySnapshot, DAILY_TARGET } from "@/features/scoring";
import { selectSpeechBubble, getAnimationCue } from "@/features/speech";
import type { HealthState, SeniorityLevel } from "@/features/scoring";

export default async function DashboardPage() {
  const user = await requireUser();

  const [{ activityEventRepository }, { findLatestSnapshotByUser, upsertDailySnapshot }] =
    await Promise.all([
      import("@/lib/db/repositories/activity"),
      import("@/lib/db/repositories/snapshot"),
    ]);

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [todayEvents, sevenDayEvents, latestSnapshot] = await Promise.all([
    activityEventRepository.findByUserAndDateRange(user.userId, todayStart, todayEnd),
    activityEventRepository.findByUserAndDateRange(user.userId, sevenDaysAgo, todayEnd),
    findLatestSnapshotByUser(user.userId),
  ]);

  const previousHealth = latestSnapshot?.health ?? 62;
  const lastSnapshotDate = latestSnapshot?.date ? new Date(latestSnapshot.date) : null;

  const snapshotResult = computeDailySnapshot({
    todayEvents: todayEvents.map((e) => ({
      type: e.type,
      energyEarned: e.energyEarned,
      tags: (e.tags as string[]) ?? [],
      occurredAt: new Date(e.occurredAt),
    })),
    sevenDayEvents: sevenDayEvents.map((e) => ({
      type: e.type,
      tags: (e.tags as string[]) ?? [],
      occurredAt: new Date(e.occurredAt),
    })),
    previousHealth,
    lastSnapshotDate,
    today,
  });

  await upsertDailySnapshot({
    userId: user.userId,
    date: todayStr,
    energyEarned: snapshotResult.energyEarned,
    health: snapshotResult.health,
    healthState: snapshotResult.healthState,
    seniorityScore: snapshotResult.seniorityScore,
    seniorityLevel: snapshotResult.seniorityLevel,
    scoreBreakdown: snapshotResult.scoreBreakdown,
    completedQuests: latestSnapshot?.completedQuests ?? [],
    powerUpsEarned: latestSnapshot?.powerUpsEarned ?? [],
  });

  const energy = calculateDailyEnergy(
    todayEvents.map((e) => ({ type: e.type, energyEarned: e.energyEarned })),
  );

  const topTags = getTopTags(
    sevenDayEvents.map((e) => ({ tags: (e.tags as string[]) ?? [], type: e.type })),
  );

  const speechContext = {
    healthState: snapshotResult.healthState as HealthState,
    seniorityLevel: snapshotResult.seniorityLevel as SeniorityLevel,
    topTags,
    energyToday: energy.total,
    dailyTarget: DAILY_TARGET,
  };

  const speechBubble = selectSpeechBubble(speechContext);
  const animationCue = getAnimationCue(speechContext);

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-12">
      <section className="rounded-3xl border border-slate-800 bg-slate-950 p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold">Welcome, {user.username}</h1>
            <p className="mt-3 text-slate-300">
              Your duck companion reflects your daily learning habits.
            </p>
          </div>
          <form action={logoutAccount}>
            <button
              className="rounded-xl border border-slate-700 px-4 py-2 font-semibold text-slate-100 transition-colors hover:border-red-800 hover:bg-red-950"
              type="submit"
            >
              Log out
            </button>
          </form>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-950 p-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <DuckAvatar
            healthState={snapshotResult.healthState as HealthState}
            seniorityLevel={snapshotResult.seniorityLevel as SeniorityLevel}
            animationCue={animationCue}
          />
          <div className="flex-1 space-y-4">
            <DuckSpeechBubble speech={speechBubble} animationCue={animationCue} />
            <EnergyProgress energyToday={energy.total} dailyTarget={DAILY_TARGET} />
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-950 p-8">
        <h2 className="mb-4 text-lg font-semibold">Demo actions</h2>
        <p className="mb-4 text-sm text-slate-400">
          Simulate daily.dev activity to see how energy and health respond. Each action type has a
          daily cap.
        </p>
        <DemoActions />
      </section>

      {todayEvents.length > 0 ? (
        <section className="rounded-3xl border border-slate-800 bg-slate-950 p-8">
          <h2 className="mb-4 text-lg font-semibold">Today&rsquo;s activity</h2>
          <ul className="divide-y divide-slate-800">
            {todayEvents.slice(0, 10).map((event) => (
              <li key={event.id} className="flex items-center justify-between py-3">
                <div>
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-300">
                    {event.type}
                  </span>
                  <span className="ml-2 text-sm text-slate-400">
                    {event.postTitle ?? "Untitled"}
                  </span>
                </div>
                <span className="text-sm text-yellow-400 tabular-nums">+{event.energyEarned}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}

function getTopTags(events: { tags: string[]; type: string }[]): string[] {
  const counts = new Map<string, number>();
  for (const event of events) {
    for (const tag of event.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([tag]) => tag);
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}
