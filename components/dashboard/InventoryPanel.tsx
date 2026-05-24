"use client";

import { useState, useTransition } from "react";
import { usePowerUpAction } from "@/app/dashboard/actions";
import type { InventoryState } from "@/features/powerups";

const TYPE_LABELS: Record<string, string> = {
  snack: "Snack",
  medicine: "Medicine",
  knowledge_gem: "Knowledge Gem",
  social_boost: "Social Boost",
  revive_feather: "Revive Feather",
};

const TYPE_EFFECTS: Record<string, string> = {
  snack: "+10 energy",
  medicine: "+15 health",
  knowledge_gem: "2x next read",
  social_boost: "2x next comment/share",
  revive_feather: "Restore health to 35 (below 25 only)",
};

export function InventoryPanel({
  inventory: initialInventory,
  currentHealth,
  activeEffects,
}: {
  inventory: InventoryState[];
  currentHealth: number;
  activeEffects: { type: string; appliesToAction: string }[];
}) {
  const [inventory, setInventory] = useState(initialInventory);
  const [isPending, startTransition] = useTransition();
  const [useResult, setUseResult] = useState<string | null>(null);

  function handleUse(type: string) {
    startTransition(async () => {
      try {
        const result = await usePowerUpAction(type);
        if (result.status === "ok") {
          setInventory(result.inventory);
          setUseResult(getResultMessage(type, result.effect));
        } else if (result.status === "not_held") {
          setUseResult("You don't have this power-up.");
        } else if (result.status === "health_too_high") {
          setUseResult("Health is too high to use Revive Feather.");
        } else {
          setUseResult("Something went wrong.");
        }
        setTimeout(() => setUseResult(null), 4000);
      } catch {
        setUseResult("Something went wrong. Try again.");
        setTimeout(() => setUseResult(null), 4000);
      }
    });
  }

  const heldItems = inventory.filter((item) => item.quantity > 0);

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950 p-8">
      <h2 className="mb-1 text-lg font-semibold">Inventory</h2>
      <p className="mb-6 text-sm text-slate-400">
        Use earned power-ups to boost energy, restore health, or multiply activity rewards.
      </p>

      {useResult ? (
        <p className="animate-in fade-in mb-4 text-sm font-medium text-emerald-400">{useResult}</p>
      ) : null}

      {activeEffects.length > 0 ? (
        <div className="mb-6 rounded-2xl border border-indigo-800/50 bg-indigo-950/30 p-4">
          <h3 className="mb-2 text-sm font-semibold text-indigo-300">Active effects</h3>
          <ul className="space-y-1">
            {activeEffects.map((effect, i) => (
              <li key={i} className="text-sm text-indigo-400">
                {TYPE_LABELS[effect.type] ?? effect.type}:{" "}
                {effect.type === "knowledge_gem" ? "2x next read" : "2x next comment/share"}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {heldItems.length === 0 ? (
        <p className="text-sm text-slate-500">No power-ups yet. Complete quests to earn them.</p>
      ) : (
        <ul className="space-y-3">
          {heldItems.map((item) => (
            <li
              key={item.type}
              className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900 p-4"
            >
              <div>
                <span className="font-semibold">{TYPE_LABELS[item.type] ?? item.type}</span>
                <span className="ml-2 text-sm text-slate-400">
                  x{item.quantity} — {TYPE_EFFECTS[item.type] ?? ""}
                </span>
              </div>
              <button
                onClick={() => handleUse(item.type)}
                disabled={isPending}
                className="shrink-0 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:border-indigo-600 hover:bg-indigo-950 disabled:opacity-50"
                type="button"
              >
                Use
              </button>
            </li>
          ))}
        </ul>
      )}

      {currentHealth < 25 && (
        <p className="mt-4 text-sm font-medium text-amber-400">
          Your duck is in poor health ({currentHealth}/100). Use the Revive Feather to restore
          health to 35.
        </p>
      )}
    </section>
  );
}

function getResultMessage(
  type: string,
  effect: { effectType: string; value?: number; targetHealth?: number },
): string {
  switch (effect.effectType) {
    case "energy":
      return `Used ${TYPE_LABELS[type] ?? type}: +${effect.value} energy!`;
    case "health":
      return `Used ${TYPE_LABELS[type] ?? type}: +${effect.value} health!`;
    case "set_health":
      return `Revive Feather activated! Health restored to ${effect.targetHealth}.`;
    case "multiplier":
      return `Used ${TYPE_LABELS[type] ?? type}: next ${type === "knowledge_gem" ? "read" : "comment/share"} will have ${effect.value}x energy!`;
    default:
      return `Used ${TYPE_LABELS[type] ?? type}!`;
  }
}
