import type { ActivityType } from "@/features/activity";

export type PowerUpType =
  | "snack"
  | "medicine"
  | "knowledge_gem"
  | "social_boost"
  | "revive_feather";

export type PowerUpEffect =
  | { effectType: "energy"; value: number }
  | { effectType: "health"; value: number }
  | { effectType: "set_health"; targetHealth: number }
  | { effectType: "multiplier"; appliesToAction: string; multiplier: number };

export type UsePowerUpInput = {
  type: PowerUpType;
};

export type UsePowerUpContext = {
  currentHealth: number;
};

export type UsePowerUpValidation =
  | { status: "ok"; effect: PowerUpEffect }
  | { status: "not_held" }
  | { status: "health_too_high" }
  | { status: "invalid_type" };

export type UsePowerUpResult =
  | { status: "ok"; effect: PowerUpEffect; inventory: InventoryState[] }
  | { status: "not_held" }
  | { status: "health_too_high" }
  | { status: "invalid_type" };

export type InventoryState = {
  type: PowerUpType;
  quantity: number;
};

export type ActivePowerUpEffect = {
  id: string;
  userId: string;
  type: PowerUpType;
  appliesToAction: ActivityType;
  multiplier: number;
  expiresAt: Date | null;
  createdAt: Date;
};

export type ActiveEffectDraft = {
  userId: string;
  type: PowerUpType;
  appliesToAction: ActivityType;
  multiplier: number;
  expiresAt?: Date | null;
};
