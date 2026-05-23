import { DuckAvatar } from "@/components/duck/DuckAvatar";
import { logoutAccount } from "../auth/actions";
import { requireUser } from "../auth/require-user";

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-12">
      <section className="rounded-3xl border border-slate-800 bg-slate-950 p-8">
        <DuckAvatar healthState="stable" seniorityLevel="code_monkey" />
        <h1 className="mt-6 text-4xl font-bold">Welcome, {user.username}</h1>
        <p className="mt-3 text-slate-300">
          Your authenticated Devine session is active. Demo activity, scoring, quests, and power-ups
          will compose here.
        </p>
        <form action={logoutAccount} className="mt-6">
          <button
            className="rounded-xl border border-slate-700 px-4 py-2 font-semibold text-slate-100"
            type="submit"
          >
            Log out
          </button>
        </form>
      </section>
    </main>
  );
}
