import { and, eq } from "drizzle-orm";
import type { PowerUpType } from "@/features/quests/domain/types";
import type { InventoryRepository } from "@/features/quests/application/ports";
import { POWER_UP_MAX_HELD } from "@/features/quests/domain/config";
import { db } from "../client";
import { powerUpInventory, auditEvents, activePowerUpEffects } from "../schema";
import type { ActivePowerUpEffect, ActiveEffectDraft } from "@/features/powerups";
import type { ActiveEffectRepository } from "@/features/powerups/application/ports";

type InventoryRow = {
  id: string;
  userId: string;
  type: PowerUpType;
  quantity: number;
};

function mapRow(row: typeof powerUpInventory.$inferSelect): InventoryRow {
  return {
    id: row.id,
    userId: row.userId,
    type: row.type as PowerUpType,
    quantity: row.quantity,
  };
}

export const inventoryRepository: InventoryRepository = {
  async findByUser(userId: string): Promise<InventoryRow[]> {
    const rows = await db.query.powerUpInventory.findMany({
      where: eq(powerUpInventory.userId, userId),
    });
    return rows.map(mapRow);
  },

  async decrement(userId: string, type: PowerUpType, amount: number): Promise<InventoryRow> {
    const existingRows = await db
      .select()
      .from(powerUpInventory)
      .where(and(eq(powerUpInventory.userId, userId), eq(powerUpInventory.type, type)));
    const existing = existingRows[0];
    const currentQty = existing?.quantity ?? 0;
    const newQty = Math.max(0, currentQty - amount);

    const rows = await db
      .insert(powerUpInventory)
      .values({ userId, type, quantity: newQty, createdAt: new Date(), updatedAt: new Date() })
      .onConflictDoUpdate({
        target: [powerUpInventory.userId, powerUpInventory.type],
        set: { quantity: newQty, updatedAt: new Date() },
      })
      .returning();

    const row = rows[0];
    if (!row) throw new Error("Failed to decrement inventory");
    return mapRow(row);
  },

  async increment(
    userId: string,
    type: PowerUpType,
    amount: number,
  ): Promise<{ row: InventoryRow; capped: boolean }> {
    const maxHeld = POWER_UP_MAX_HELD[type] ?? 0;
    const existingRows = await db
      .select()
      .from(powerUpInventory)
      .where(and(eq(powerUpInventory.userId, userId), eq(powerUpInventory.type, type)));
    const existing = existingRows[0];
    const currentQty = existing?.quantity ?? 0;
    const newQty = Math.min(maxHeld, currentQty + amount);
    const capped = currentQty + amount > maxHeld;

    const rows = await db
      .insert(powerUpInventory)
      .values({ userId, type, quantity: newQty, createdAt: new Date(), updatedAt: new Date() })
      .onConflictDoUpdate({
        target: [powerUpInventory.userId, powerUpInventory.type],
        set: { quantity: newQty, updatedAt: new Date() },
      })
      .returning();

    const row = rows[0];
    if (!row) throw new Error("Failed to update inventory");
    return { row: mapRow(row), capped };
  },
};

function mapActiveEffectRow(row: typeof activePowerUpEffects.$inferSelect): ActivePowerUpEffect {
  return {
    id: row.id,
    userId: row.userId,
    type: row.type as PowerUpType,
    appliesToAction: row.appliesToAction as "read" | "comment" | "share",
    multiplier: row.multiplier,
    expiresAt: row.expiresAt ? new Date(row.expiresAt) : null,
    createdAt: new Date(row.createdAt),
  };
}

export const activeEffectRepository: ActiveEffectRepository = {
  async findByUser(userId: string): Promise<ActivePowerUpEffect[]> {
    const rows = await db.query.activePowerUpEffects.findMany({
      where: eq(activePowerUpEffects.userId, userId),
    });
    return rows.map(mapActiveEffectRow);
  },

  async create(draft: ActiveEffectDraft): Promise<ActivePowerUpEffect> {
    const rows = await db
      .insert(activePowerUpEffects)
      .values({
        userId: draft.userId,
        type: draft.type,
        appliesToAction: draft.appliesToAction,
        multiplier: draft.multiplier,
        expiresAt: draft.expiresAt ?? null,
        createdAt: new Date(),
      })
      .returning();
    const row = rows[0];
    if (!row) throw new Error("Failed to create active effect");
    return mapActiveEffectRow(row);
  },
};

export async function createAuditEvent(params: {
  actorUserId?: string;
  targetUserId: string;
  type: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await db.insert(auditEvents).values({
    actorUserId: params.actorUserId ?? null,
    targetUserId: params.targetUserId,
    type: params.type,
    metadata: params.metadata ?? {},
    createdAt: new Date(),
  });
}
