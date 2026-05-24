"use client";

import { useState, useTransition } from "react";
import { claimQuestRewardAction } from "@/app/dashboard/actions";
import type { QuestView } from "@/features/quests";

const RESET_LABELS: Record<string, string> = {
  daily: "Resets daily",
  weekly: "Resets weekly",
  never: "Does not reset",
};

export function QuestPanel({ quests: initialQuests }: { quests: QuestView[] }) {
  const [quests, setQuests] = useState(initialQuests);
  const [isPending, startTransition] = useTransition();
  const [claimError, setClaimError] = useState<string | null>(null);

  function handleClaim(questId: string) {
    startTransition(async () => {
      try {
        const result = await claimQuestRewardAction(questId);
        if (result.status === "ok") {
          setQuests((prev) => prev.map((q) => (q.id === questId ? result.quest : q)));
          setClaimError(null);
        } else if (result.status === "already_claimed") {
          setClaimError("Already claimed this reward.");
        } else if (result.status === "quest_not_completed") {
          setClaimError("Quest is not yet completed.");
        } else if (result.status === "not_found") {
          setClaimError("Quest not found.");
        } else {
          setClaimError("Something went wrong.");
        }
        setTimeout(() => setClaimError(null), 3000);
      } catch {
        setClaimError("Something went wrong. Try again.");
        setTimeout(() => setClaimError(null), 3000);
      }
    });
  }

  const typeOrder: Record<string, number> = { daily: 0, personalized: 1, weekly: 2 };

  const sorted = [...quests].sort((a, b) => (typeOrder[a.type] ?? 0) - (typeOrder[b.type] ?? 0));

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950 p-8">
      <h2 className="mb-1 text-lg font-semibold">Quests</h2>
      <p className="mb-6 text-sm text-slate-400">Complete quests to earn power-ups.</p>

      {claimError ? (
        <p className="animate-in fade-in mb-4 text-sm font-medium text-yellow-400">{claimError}</p>
      ) : null}

      <ul className="space-y-4">
        {sorted.map((quest) => (
          <QuestCard key={quest.id} quest={quest} isPending={isPending} onClaim={handleClaim} />
        ))}
      </ul>
    </section>
  );
}

function QuestCard({
  quest,
  isPending,
  onClaim,
}: {
  quest: QuestView;
  isPending: boolean;
  onClaim: (id: string) => void;
}) {
  const pct = Math.min(100, Math.round((quest.progress / quest.target) * 100));

  return (
    <li className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium tracking-wider text-slate-500 uppercase">
              {quest.type}
            </span>
            {quest.status === "claimed" ? (
              <span className="rounded-full bg-green-900/50 px-2 py-0.5 text-xs font-medium text-green-400">
                Claimed
              </span>
            ) : quest.status === "completed" ? (
              <span className="rounded-full bg-yellow-900/50 px-2 py-0.5 text-xs font-medium text-yellow-400">
                Complete
              </span>
            ) : null}
          </div>
          <h3 className="mt-1 font-semibold">{quest.title}</h3>
          <p className="text-sm text-slate-400">{quest.description}</p>
        </div>

        {quest.status === "completed" ? (
          <button
            onClick={() => onClaim(quest.id)}
            disabled={isPending}
            className="shrink-0 rounded-xl border border-yellow-700 bg-yellow-900/30 px-4 py-2 text-sm font-semibold text-yellow-400 transition-colors hover:border-yellow-500 hover:bg-yellow-900/50 disabled:opacity-50"
            type="button"
          >
            Claim {quest.rewardType}
          </button>
        ) : quest.status === "claimed" ? (
          <span className="shrink-0 rounded-xl border border-green-800 bg-green-900/20 px-3 py-1 text-xs font-medium text-green-400">
            +{quest.rewardQuantity} {quest.rewardType}
          </span>
        ) : null}
      </div>

      <div className="mt-3 space-y-1.5">
        <div className="flex items-baseline justify-between text-sm">
          <span className="text-slate-400">
            Progress {quest.progress}/{quest.target}
          </span>
          {quest.status !== "claimed" ? <span className="text-slate-500">{pct}%</span> : null}
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              quest.status === "completed" || quest.status === "claimed"
                ? "bg-gradient-to-r from-green-500 to-emerald-500"
                : "bg-gradient-to-r from-blue-500 to-indigo-500"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-slate-600">{getResetLabel(quest.key)}</p>
      </div>
    </li>
  );
}

function getResetLabel(key: string): string {
  if (key === "weakest_area") return RESET_LABELS.daily;
  if (key === "five_day_streak") return RESET_LABELS.weekly;
  return RESET_LABELS.daily;
}
