"use client";

import { useState, useTransition } from "react";
import { applyDemoDashboardAction } from "@/app/dashboard/actions";
import type { ActivityType } from "@/features/activity";

const ACTIONS: { type: ActivityType; label: string; emoji: string }[] = [
  { type: "read", label: "Read an article", emoji: "📖" },
  { type: "upvote", label: "Upvote a post", emoji: "👍" },
  { type: "bookmark", label: "Bookmark a post", emoji: "🔖" },
  { type: "comment", label: "Write a comment", emoji: "💬" },
  { type: "share", label: "Share a post", emoji: "🔄" },
];

export function DemoActions() {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  function handleAction(type: ActivityType) {
    startTransition(async () => {
      try {
        const result = await applyDemoDashboardAction(type);
        if (result.status === "ok" && result.energyEarned > 0) {
          setFeedback(`+${result.energyEarned} energy`);
        } else if (result.energyEarned === 0) {
          setFeedback("Daily cap reached — no energy earned but still recorded.");
        } else {
          setFeedback("Already recorded.");
        }
        setTimeout(() => setFeedback(null), 2000);
      } catch {
        setFeedback("Something went wrong. Try again.");
        setTimeout(() => setFeedback(null), 3000);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {ACTIONS.map(({ type, label, emoji }) => (
          <button
            key={type}
            onClick={() => handleAction(type)}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-slate-500 hover:bg-slate-800 disabled:opacity-50"
          >
            <span aria-hidden="true">{emoji}</span>
            {label}
          </button>
        ))}
      </div>
      {feedback ? (
        <p
          key={feedback}
          className="animate-in fade-in slide-in-from-top-2 text-sm font-medium text-yellow-400"
        >
          {feedback}
        </p>
      ) : null}
    </div>
  );
}
