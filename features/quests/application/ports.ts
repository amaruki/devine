import type { QuestRow, QuestDraft, QuestStatus, PowerUpType } from "../domain/types";

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
};

export type InventoryRow = {
  id: string;
  userId: string;
  type: PowerUpType;
  quantity: number;
};

export type InventoryRepository = {
  findByUser(userId: string): Promise<InventoryRow[]>;
  increment(
    userId: string,
    type: PowerUpType,
    amount: number,
  ): Promise<{ row: InventoryRow; capped: boolean }>;
};
