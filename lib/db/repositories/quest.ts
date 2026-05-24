import { and, eq, inArray } from "drizzle-orm";
import type {
  QuestRow,
  QuestDraft,
  QuestStatus,
  PowerUpType,
} from "@/features/quests/domain/types";
import { db } from "../client";
import { quests } from "../schema";

export type QuestRepository = {
  findByUserAndDateScope(userId: string, dateScope: string): Promise<QuestRow[]>;
  findByUserAndKeys(userId: string, keys: string[], dateScope: string): Promise<QuestRow[]>;
  findById(userId: string, questId: string): Promise<QuestRow | null>;
  create(draft: QuestDraft): Promise<QuestRow>;
  updateProgress(
    userId: string,
    questId: string,
    progress: number,
    status: QuestStatus,
  ): Promise<QuestRow>;
  updateStatus(
    userId: string,
    questId: string,
    status: QuestStatus,
    rewardPowerUp?: PowerUpType,
  ): Promise<QuestRow>;
  deleteByUserAndDateScope(userId: string, dateScope: string): Promise<void>;
};

function mapRow(row: typeof quests.$inferSelect): QuestRow {
  return row as unknown as QuestRow;
}

export const questRepository: QuestRepository = {
  async findByUserAndDateScope(userId: string, dateScope: string): Promise<QuestRow[]> {
    const rows = await db.query.quests.findMany({
      where: and(eq(quests.userId, userId), eq(quests.dateScope, dateScope)),
    });
    return rows.map(mapRow);
  },

  async findByUserAndKeys(userId: string, keys: string[], dateScope: string): Promise<QuestRow[]> {
    if (keys.length === 0) return [];
    const rows = await db.query.quests.findMany({
      where: and(
        eq(quests.userId, userId),
        inArray(quests.questKey, keys),
        eq(quests.dateScope, dateScope),
      ),
    });
    return rows.map(mapRow);
  },

  async findById(userId: string, questId: string): Promise<QuestRow | null> {
    const row = await db.query.quests.findFirst({
      where: and(eq(quests.userId, userId), eq(quests.id, questId)),
    });
    return row ? mapRow(row) : null;
  },

  async create(draft: QuestDraft): Promise<QuestRow> {
    const rows = await db
      .insert(quests)
      .values({
        ...draft,
        status: draft.status ?? "active",
        progress: draft.progress ?? 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    const row = rows[0];
    if (!row) throw new Error("Failed to create quest");
    return mapRow(row);
  },

  async updateProgress(
    userId: string,
    questId: string,
    progress: number,
    status: QuestStatus,
  ): Promise<QuestRow> {
    const rows = await db
      .update(quests)
      .set({ progress, status, updatedAt: new Date() })
      .where(and(eq(quests.userId, userId), eq(quests.id, questId)))
      .returning();
    const row = rows[0];
    if (!row) throw new Error("Failed to update quest progress");
    return mapRow(row);
  },

  async updateStatus(
    userId: string,
    questId: string,
    status: QuestStatus,
    rewardPowerUp?: PowerUpType,
  ): Promise<QuestRow> {
    const rows = await db
      .update(quests)
      .set({ status, rewardPowerUp, updatedAt: new Date() })
      .where(and(eq(quests.userId, userId), eq(quests.id, questId)))
      .returning();
    const row = rows[0];
    if (!row) throw new Error("Failed to update quest status");
    return mapRow(row);
  },

  async deleteByUserAndDateScope(userId: string, dateScope: string): Promise<void> {
    await db.delete(quests).where(and(eq(quests.userId, userId), eq(quests.dateScope, dateScope)));
  },
};
