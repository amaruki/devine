import { requireUser } from "../auth/require-user";
import { DemoResetPanel } from "@/components/settings/DemoResetPanel";
import { getUserPersona } from "@/lib/db/repositories/demo";
import type { DemoPersonaKey } from "@/features/demo";

export default async function SettingsPage() {
  const user = await requireUser();
  const persona = await getUserPersona(user.userId);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-12">
      <section className="rounded-3xl border border-slate-800 bg-slate-950 p-8">
        <p className="text-sm tracking-[0.3em] text-cyan-300 uppercase">{user.username}</p>
        <h1 className="mt-2 text-4xl font-bold">Settings</h1>
        <p className="mt-3 text-slate-300">
          Manage your daily.dev token connection and demo mode preferences.
        </p>
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-950 p-8">
        <h2 className="text-lg font-semibold">Demo mode</h2>
        <p className="mt-2 text-sm text-slate-400">
          Your dashboard is currently in demo mode. You can switch personas or connect a daily.dev
          token to go live.
        </p>
        <div className="mt-6">
          <DemoResetPanel currentPersona={(persona ?? "code_monkey") as DemoPersonaKey} />
        </div>
      </section>
    </main>
  );
}
