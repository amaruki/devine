"use client";

import { useState, useTransition } from "react";
import { resetDemoStateAction } from "@/app/settings/actions";
import { DEMO_PERSONAS, type DemoPersonaKey } from "@/features/demo";

type DemoResetPanelProps = {
  currentPersona: DemoPersonaKey;
};

export function DemoResetPanel({ currentPersona }: DemoResetPanelProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedPersona, setSelectedPersona] = useState<DemoPersonaKey>(currentPersona);
  const [feedback, setFeedback] = useState<string | null>(null);

  function handleReset() {
    startTransition(async () => {
      try {
        const result = await resetDemoStateAction(selectedPersona);
        if (result.status === "ok") {
          setFeedback("Demo state reset successfully!");
        } else {
          setFeedback(result.error ?? "Failed to reset demo state.");
        }
        setTimeout(() => setFeedback(null), 3000);
      } catch {
        setFeedback("Something went wrong. Try again.");
        setTimeout(() => setFeedback(null), 3000);
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-300">Select persona</label>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {Object.values(DEMO_PERSONAS).map((persona) => (
            <button
              key={persona.key}
              type="button"
              onClick={() => setSelectedPersona(persona.key)}
              className={`rounded-xl border p-4 text-left transition-colors ${
                selectedPersona === persona.key
                  ? "border-cyan-400 bg-cyan-400/10"
                  : "border-slate-700 bg-slate-900 hover:border-slate-500"
              }`}
            >
              <div className="font-medium">{persona.label}</div>
              <div className="mt-1 text-xs text-slate-400">{persona.description}</div>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleReset}
        disabled={isPending}
        className="rounded-xl border border-cyan-600 bg-cyan-600/20 px-6 py-3 font-semibold text-cyan-100 transition-colors hover:bg-cyan-600/30 disabled:opacity-50"
      >
        {isPending ? "Resetting..." : "Reset demo state"}
      </button>

      {feedback ? (
        <p className="text-sm font-medium text-yellow-400">{feedback}</p>
      ) : (
        <p className="text-xs text-slate-500">
          This will reset your demo activity, energy, and health state. Use this to explore
          different developer personas.
        </p>
      )}
    </div>
  );
}
