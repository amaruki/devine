export default function DashboardLoading() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-12">
      <section className="rounded-3xl border border-slate-800 bg-slate-950 p-8">
        <div className="h-10 w-64 animate-pulse rounded bg-slate-800" />
        <div className="mt-3 h-5 w-96 animate-pulse rounded bg-slate-800" />
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-950 p-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <div className="h-24 w-24 animate-pulse rounded-full bg-slate-800" />
          <div className="flex-1 space-y-4">
            <div className="h-16 w-full animate-pulse rounded-2xl bg-slate-800" />
            <div className="h-4 w-full animate-pulse rounded bg-slate-800" />
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-950 p-8">
        <div className="h-6 w-32 animate-pulse rounded bg-slate-800" />
        <div className="mt-2 h-4 w-80 animate-pulse rounded bg-slate-800" />
        <div className="mt-4 flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 w-36 animate-pulse rounded-xl bg-slate-800" />
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-950 p-8">
        <div className="h-6 w-36 animate-pulse rounded bg-slate-800" />
        <div className="mt-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 w-full animate-pulse rounded bg-slate-800" />
          ))}
        </div>
      </section>
    </main>
  );
}
