import { and, eq } from "drizzle-orm";
import type { PowerUpType } from "@/features/quests/domain/types";
import type { InventoryRow, InventoryRepository } from "@/features/quests/application/ports";
import { POWER_UP_MAX_HELD } from "@/features/quests/domain/config";
import { db } from "../client";
import { powerUpInventory, auditEvents } from "../schema";

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
