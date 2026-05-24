import type { ActivityType } from "@/features/activity";

export type QuestType = "daily" | "personalized" | "weekly";
export type QuestStatus = "active" | "completed" | "claimed";
export type PowerUpType =
  | "snack"
  | "medicine"
  | "knowledge_gem"
  | "social_boost"
  | "revive_feather";

export type QuestConfig = {
  key: string;
  type: QuestType;
  title: string;
  description: string;
  progressEvents: ActivityType[];
  rewardType: PowerUpType;
  rewardQuantity: number;
  target: number;
  resetCadence: "daily" | "weekly" | "never";
};

export type QuestProgress = {
  key: string;
  progress: number;
  target: number;
};

export type QuestView = {
  id: string;
  key: string;
  type: QuestType;
  title: string;
  description: string;
  status: QuestStatus;
  progress: number;
  target: number;
  rewardType: PowerUpType;
  rewardQuantity: number;
  dateScope: string;
};

export type QuestRow = {
  id: string;
  userId: string;
  questKey: string;
  type: QuestType;
  status: QuestStatus;
  progress: number;
  target: number;
  rewardPowerUp: PowerUpType;
  dateScope: string;
  createdAt: Date;
  updatedAt: Date;
};

export type QuestDraft = {
  userId: string;
  questKey: string;
  type: QuestType;
  status?: QuestStatus;
  progress?: number;
  target: number;
  rewardPowerUp: PowerUpType;
  dateScope: string;
};
