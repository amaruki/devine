import { DuckAvatar } from "@/components/duck/DuckAvatar";

export default function DashboardPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-12">
      <section className="rounded-3xl border border-slate-800 bg-slate-950 p-8">
        <DuckAvatar healthState="stable" seniorityLevel="code_monkey" />
        <h1 className="mt-6 text-4xl font-bold">Dashboard stub</h1>
        <p className="mt-3 text-slate-300">
          Demo activity, scoring, quests, and power-ups will compose here.
        </p>
      </section>
    </main>
  );
}
