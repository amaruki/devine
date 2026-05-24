import type { PowerUpType, UsePowerUpContext, UsePowerUpValidation, PowerUpEffect } from "./types";

export const POWER_UP_MAX_HELD: Record<PowerUpType, number> = {
  snack: 5,
  medicine: 3,
  knowledge_gem: 2,
  social_boost: 2,
  revive_feather: 1,
};

export const POWER_UP_EFFECTS: Record<
  PowerUpType,
  { effect: "energy" | "health" | "multiplier"; value: number }
> = {
  snack: { effect: "energy", value: 10 },
  medicine: { effect: "health", value: 15 },
  knowledge_gem: { effect: "multiplier", value: 2 },
  social_boost: { effect: "multiplier", value: 2 },
  revive_feather: { effect: "health", value: 35 },
};

export function validateUsePowerUp(
  type: PowerUpType,
  heldQuantity: number,
  context: UsePowerUpContext,
): UsePowerUpValidation {
  if (heldQuantity <= 0) {
    return { status: "not_held" };
  }

  if (type === "revive_feather") {
    if (context.currentHealth >= 25) {
      return { status: "health_too_high" };
    }
    return {
      status: "ok",
      effect: { effectType: "set_health", targetHealth: 35 },
    };
  }

  const config = POWER_UP_EFFECTS[type];
  if (!config) {
    return { status: "invalid_type" };
  }

  let effect: PowerUpEffect;
  switch (config.effect) {
    case "energy":
      effect = { effectType: "energy", value: config.value };
      break;
    case "health":
      effect = { effectType: "health", value: config.value };
      break;
    case "multiplier": {
      const appliesToAction = type === "knowledge_gem" ? "read" : "comment";
      effect = {
        effectType: "multiplier",
        appliesToAction,
        multiplier: config.value,
      };
      break;
    }
    default:
      return { status: "invalid_type" };
  }

  return { status: "ok", effect };
}
