import type {
  PowerUpType,
  InventoryState,
  ActivePowerUpEffect,
  ActiveEffectDraft,
} from "../domain/types";

export type InventoryRow = {
  id: string;
  userId: string;
  type: PowerUpType;
  quantity: number;
};

export type InventoryRepository = {
  findByUser(userId: string): Promise<InventoryRow[]>;
  decrement(userId: string, type: PowerUpType, amount: number): Promise<InventoryRow>;
  increment(
    userId: string,
    type: PowerUpType,
    amount: number,
  ): Promise<{ row: InventoryRow; capped: boolean }>;
};

export type ActiveEffectRepository = {
  findByUser(userId: string): Promise<ActivePowerUpEffect[]>;
  create(draft: ActiveEffectDraft): Promise<ActivePowerUpEffect>;
};

export type UsePowerUpDeps = {
  inventory: InventoryRepository;
  activeEffects: ActiveEffectRepository;
  createAuditEvent: (params: {
    targetUserId: string;
    type: string;
    metadata?: Record<string, unknown>;
  }) => Promise<void>;
};

export function mapInventoryRowToState(row: InventoryRow): InventoryState {
  return { type: row.type, quantity: row.quantity };
}

export function mapInventoryRowsToState(rows: InventoryRow[]): InventoryState[] {
  return rows.map(mapInventoryRowToState);
}
