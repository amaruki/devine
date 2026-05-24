import { validateUsePowerUp } from "../domain";
import type {
  UsePowerUpInput,
  UsePowerUpResult,
  UsePowerUpContext,
  ActivePowerUpEffect,
} from "../domain/types";
import type { UsePowerUpDeps } from "./ports";
import { mapInventoryRowsToState } from "./ports";

export async function usePowerUp(
  userId: string,
  input: UsePowerUpInput,
  context: UsePowerUpContext,
  deps: UsePowerUpDeps,
): Promise<UsePowerUpResult> {
  const inventory = await deps.inventory.findByUser(userId);
  const entry = inventory.find((r) => r.type === input.type);
  const heldQuantity = entry?.quantity ?? 0;

  const validation = validateUsePowerUp(input.type, heldQuantity, context);
  if (validation.status !== "ok") {
    return validation;
  }

  const { effect } = validation;

  // Decrement inventory — power-ups are one-shot
  await deps.inventory.decrement(userId, input.type, 1);

  // Register active effect for multipliers (knowledge_gem, social_boost)
  // Energy/health effects are immediate and don't create active entries
  if (effect.effectType === "multiplier") {
    await deps.activeEffects.create({
      userId,
      type: input.type,
      appliesToAction: effect.appliesToAction as "read" | "comment" | "share",
      multiplier: effect.multiplier,
      expiresAt: null, // persists until consumed by next matching event
    });
  }

  await deps.createAuditEvent({
    targetUserId: userId,
    type: "power_up_use",
    metadata: {
      powerUpType: input.type,
      effect,
      previousQuantity: heldQuantity,
    },
  });

  const updatedInventory = await deps.inventory.findByUser(userId);

  return {
    status: "ok",
    effect,
    inventory: mapInventoryRowsToState(updatedInventory),
  };
}

export function consumeMatchingEffect(
  actionType: string,
  effects: ActivePowerUpEffect[],
): { multiplier: number; consumed: ActivePowerUpEffect[] } {
  const consumed: ActivePowerUpEffect[] = [];
  let multiplier = 1;

  for (const effect of effects) {
    if (effect.appliesToAction === actionType) {
      multiplier *= effect.multiplier;
      consumed.push(effect);
    }
  }

  return { multiplier, consumed };
}
