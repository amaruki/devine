import type { ActivityEvent } from "@/features/activity";

const SOURCE_LABELS: Record<string, string> = {
  dailydev_api: "daily.dev",
  in_app: "in-app",
  manual: "manual",
  demo: "demo",
};

function formatTimestamp(value: string | Date): string {
  const d = new Date(value);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function RecentActivity({ events }: { events: ActivityEvent[] }) {
  if (events.length === 0) {
    return (
      <section className="rounded-3xl border border-slate-800 bg-slate-950 p-8">
        <h2 className="mb-2 text-lg font-semibold">Recent activity</h2>
        <p className="text-sm text-slate-500">
          No activity yet. Simulate an action below or connect daily.dev to start tracking.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950 p-8">
      <h2 className="mb-4 text-lg font-semibold">Recent activity</h2>
      <ul className="divide-y divide-slate-800">
        {events.map((event) => {
          const tags = (event.tags as string[]) ?? [];
          const occurredAt = formatTimestamp(event.occurredAt);
          const sourceLabel = SOURCE_LABELS[event.source] ?? event.source;

          return (
            <li
              key={event.id}
              className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-300 uppercase">
                    {event.type}
                  </span>
                  {tags.length > 0 ? (
                    <span className="flex flex-wrap gap-1">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-slate-800/50 px-1.5 py-0.5 text-xs text-slate-500"
                        >
                          {tag}
                        </span>
                      ))}
                    </span>
                  ) : null}
                  <span className="text-xs text-slate-600">{sourceLabel}</span>
                </div>
                <p className="mt-1 truncate text-sm text-slate-300">
                  {event.postTitle ?? "Untitled"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-xs text-slate-600">{occurredAt}</span>
                <span className="text-sm font-medium text-yellow-400 tabular-nums">
                  +{event.energyEarned}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
