export type {
  QuestType,
  QuestStatus,
  PowerUpType,
  QuestConfig,
  QuestProgress,
  QuestView,
  QuestRow,
  QuestDraft,
} from "./domain/types";

export type { QuestRepository, InventoryRow, InventoryRepository } from "./application/ports";

export {
  QUEST_DEFINITIONS,
  getDailyQuestDefinitions,
  getWeeklyQuestDefinitions,
  getQuestDefinition,
  getTodayDateScope,
  getWeekScope,
  POWER_UP_MAX_HELD,
  POWER_UP_EFFECTS,
} from "./domain/config";

export {
  calculateQuestProgress,
  determineQuestStatus,
  generatePersonalizedQuest,
  shouldResetQuest,
  buildQuestView,
  buildQuestViewFromConfig,
} from "./domain/progress";

export type {
  QuestState,
  ClaimQuestRewardInput,
  ClaimQuestRewardResult,
  QuestServiceDeps,
  ClaimDeps,
} from "./application";

export { getQuestState, claimQuestReward } from "./application";
