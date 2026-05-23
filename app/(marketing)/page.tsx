import Link from "next/link";

export default function MarketingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6">
      <p className="text-sm tracking-[0.3em] text-cyan-300 uppercase">Devine</p>
      <h1 className="text-5xl font-bold">Keep your reading duck alive.</h1>
      <p className="text-lg text-slate-300">
        Connect daily.dev or use demo mode to turn developer reading into energy, quests, and
        power-ups.
      </p>
      <div className="flex gap-3">
        <Link
          className="rounded-full bg-cyan-300 px-5 py-3 font-semibold text-slate-950"
          href="/dashboard"
        >
          Open dashboard
        </Link>
        <Link
          className="rounded-full border border-slate-600 px-5 py-3 font-semibold"
          href="/settings"
        >
          Settings
        </Link>
      </div>
    </main>
  );
}
