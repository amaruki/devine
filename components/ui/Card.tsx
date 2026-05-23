import type { ReactNode } from "react";

export function Card({ children }: { children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950 p-6">{children}</section>
  );
}
