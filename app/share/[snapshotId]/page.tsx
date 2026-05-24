import { DuckAvatar } from "@/components/duck/DuckAvatar";
import { getPublicShareSnapshot } from "@/features/share";
import { notFound } from "next/navigation";
import type { SeniorityLevel, HealthState } from "@/features/scoring";

const seniorityLabels = {
  ignorant_copaster: "The Ignorant Copaster",
  code_monkey: "The Code Monkey",
  grounded_scholar: "The Grounded Scholar",
  tech_philosopher: "The Tech Philosopher",
};

const healthLabels = {
  thriving: "Thriving",
  stable: "Stable",
  tired: "Tired",
  sick: "Sick",
  critical: "Critical",
  hibernating: "Hibernating",
};

export default async function ShareSnapshotPage({
  params,
}: {
  params: Promise<{ snapshotId: string }>;
}) {
  const { snapshotId } = await params;
  const result = await getPublicShareSnapshot(snapshotId);

  if (result.status === "not_found") {
    notFound();
  }

  if (result.status === "deleted") {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6">
        <p className="text-sm tracking-[0.3em] text-cyan-300 uppercase">Devine Snapshot</p>
        <h1 className="text-4xl font-bold">This duck has paddled away.</h1>
        <p className="text-slate-300">This public snapshot was deleted by its owner.</p>
      </main>
    );
  }

  const { snapshot } = result;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-8 px-6 py-12">
      <section className="rounded-3xl border border-slate-800 bg-slate-950 p-8 shadow-2xl shadow-cyan-950/30">
        <p className="text-sm tracking-[0.3em] text-cyan-300 uppercase">Devine Snapshot</p>
        <div className="mt-8 grid gap-8 md:grid-cols-[180px_1fr] md:items-center">
          <DuckAvatar
            healthState={snapshot.healthState as HealthState}
            seniorityLevel={snapshot.seniorityLevel as SeniorityLevel}
            animationCue="idle"
          />
          <div>
            <h1 className="text-4xl font-bold">{seniorityLabels[snapshot.seniorityLevel]}</h1>
            <p className="mt-3 text-xl text-slate-300">
              Seniority Score: {snapshot.seniorityScore} / 100
            </p>
            <p className="mt-2 text-lg text-slate-300">
              Health: {healthLabels[snapshot.healthState]}
            </p>
          </div>
        </div>
        <div className="mt-8 space-y-6">
          <div>
            <h2 className="text-sm tracking-[0.25em] text-slate-400 uppercase">Top signals</h2>
            <p className="mt-2 text-lg text-cyan-200">{snapshot.topTags.join(" · ")}</p>
          </div>
          <blockquote className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 p-5 text-xl text-cyan-50">
            “{snapshot.speechBubble}”
          </blockquote>
          <div className="flex flex-col gap-2 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Generated{" "}
              {new Date(snapshot.generatedAt).toLocaleDateString("en", { dateStyle: "long" })}
            </p>
            <p>Powered by daily.dev</p>
          </div>
        </div>
      </section>
    </main>
  );
}
