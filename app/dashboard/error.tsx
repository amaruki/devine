"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-12">
      <section className="rounded-3xl border border-slate-800 bg-slate-950 p-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-3 text-slate-300">Something went wrong loading your dashboard.</p>
        <p className="mt-1 text-sm text-slate-500">
          {error.message === "unauthorized"
            ? "Please log in to view your dashboard."
            : "An unexpected error occurred. Please try again."}
        </p>
        <button
          onClick={reset}
          className="mt-4 inline-flex items-center rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-slate-500 hover:bg-slate-800"
        >
          Try again
        </button>
      </section>
    </main>
  );
}
