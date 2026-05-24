import { DuckAvatar } from "@/components/duck/DuckAvatar";
import { EnergyProgress } from "@/components/dashboard/EnergyProgress";
import { DemoActions } from "@/components/dashboard/DemoActions";
import { logoutAccount } from "../auth/actions";
import { requireUser } from "../auth/require-user";
import { calculateDailyEnergy, DAILY_TARGET } from "@/features/scoring";
import type { HealthState, SeniorityLevel } from "@/features/scoring";

export default async function DashboardPage() {
  const user = await requireUser();

  const [{ activityEventRepository }, { findLatestSnapshotByUser }] = await Promise.all([
    import("@/lib/db/repositories/activity"),
    import("@/lib/db/repositories/snapshot"),
  ]);

  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());
  const todayEvents = await activityEventRepository.findByUserAndDateRange(
    user.userId,
    todayStart,
    todayEnd,
  );
  const energy = calculateDailyEnergy(todayEvents);
  const snapshot = await findLatestSnapshotByUser(user.userId);

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
        <DuckAvatar
          healthState={(snapshot?.healthState as HealthState) ?? "stable"}
          seniorityLevel={(snapshot?.seniorityLevel as SeniorityLevel) ?? "code_monkey"}
        />
        <div className="mt-6">
          <EnergyProgress energyToday={energy.total} dailyTarget={DAILY_TARGET} />
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
