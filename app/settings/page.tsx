import { requireUser } from "../auth/require-user";

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6">
      <p className="text-sm tracking-[0.3em] text-cyan-300 uppercase">{user.username}</p>
      <h1 className="text-4xl font-bold">Settings stub</h1>
      <p className="text-slate-300">
        daily.dev token connection and demo reset controls will live here.
      </p>
    </main>
  );
}
