// Locked public exports per docs/technical-specs/13-scoring-game-loop-strategy.md §13.6
export { usePowerUp, consumeMatchingEffect } from "./application";
export type {
  InventoryRow,
  InventoryRepository,
  ActiveEffectRepository,
  UsePowerUpDeps,
} from "./application";
export { validateUsePowerUp, POWER_UP_MAX_HELD, POWER_UP_EFFECTS } from "./domain";
export type {
  PowerUpType,
  PowerUpEffect,
  UsePowerUpInput,
  UsePowerUpContext,
  UsePowerUpValidation,
  UsePowerUpResult,
  InventoryState,
  ActivePowerUpEffect,
  ActiveEffectDraft,
} from "./domain";
