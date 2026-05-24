import type { QuestView, QuestConfig } from "../domain/types";
import type { QuestRepository, InventoryRow, InventoryRepository } from "./ports";
import type { ActivityEventRepository } from "@/features/activity/application/ports";
import {
  QUEST_DEFINITIONS,
  getDailyQuestDefinitions,
  getWeeklyQuestDefinitions,
  getTodayDateScope,
  getWeekScope,
} from "../domain/config";
import {
  calculateQuestProgress,
  generatePersonalizedQuest,
  buildQuestView,
  buildQuestViewFromConfig,
} from "../domain/progress";
import type { ScoreBreakdown } from "@/features/scoring";

export type QuestState = {
  quests: QuestView[];
};

export type QuestServiceDeps = {
  quests: QuestRepository;
  events: ActivityEventRepository;
};

export type ClaimQuestRewardInput = {
  questId: string;
};

export type ClaimQuestRewardResult =
  | { status: "ok"; quest: QuestView; inventory: InventoryRow[] }
  | { status: "not_found" }
  | { status: "quest_not_completed" }
  | { status: "already_claimed" }
  | { status: "unauthorized" };

export async function getQuestState(
  userId: string,
  scoreBreakdown: ScoreBreakdown,
  deps: QuestServiceDeps,
): Promise<QuestState> {
  const todayScope = getTodayDateScope();
  const weekScope = getWeekScope();

  const existingRows = await deps.quests.findByUserAndDateScope(userId, todayScope);

  const dailyDefs = getDailyQuestDefinitions();
  const weeklyDefs = getWeeklyQuestDefinitions();

  const existingByKey = new Map(existingRows.map((r) => [r.questKey, r]));

  const quests: QuestView[] = [];

  for (const def of dailyDefs) {
    const existing = existingByKey.get(def.key);
    if (existing) {
      quests.push(buildQuestView(existing));
    } else {
      const progress = await computeProgressForDefinition(userId, def, deps);
      const view = buildQuestViewFromConfig(def, progress, todayScope);
      quests.push(view);
    }
  }

  for (const def of weeklyDefs) {
    const existing = existingByKey.get(def.key);
    if (existing) {
      quests.push(buildQuestView(existing));
    } else {
      const progress = await computeProgressForDefinition(userId, def, deps);
      const view = buildQuestViewFromConfig(def, progress, weekScope);
      quests.push(view);
    }
  }

  const personalized = generatePersonalizedQuest(scoreBreakdown);
  if (personalized) {
    const existing = existingByKey.get(personalized.key);
    if (existing) {
      quests.push(buildQuestView(existing));
    } else {
      const progress = await computeProgressForDefinition(userId, personalized, deps);
      const view = buildQuestViewFromConfig(personalized, progress, todayScope);
      quests.push(view);
    }
  }

  return { quests };
}

async function computeProgressForDefinition(
  userId: string,
  config: QuestConfig,
  deps: QuestServiceDeps,
): Promise<number> {
  const now = new Date();
  let from: Date;
  const to = new Date(now);

  if (config.resetCadence === "daily") {
    from = new Date(now);
    from.setUTCHours(0, 0, 0, 0);
    to.setUTCHours(23, 59, 59, 999);
  } else if (config.resetCadence === "weekly") {
    from = new Date(now);
    const day = from.getUTCDay();
    const diff = from.getUTCDate() - day + (day === 0 ? -6 : 1);
    from.setUTCDate(diff);
    from.setUTCHours(0, 0, 0, 0);
  } else {
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    from = sevenDaysAgo;
  }

  const events = await deps.events.findByUserAndDateRange(userId, from, to);
  const progressResult = calculateQuestProgress(config, events);
  return progressResult.progress;
}

export type ClaimDeps = QuestServiceDeps & {
  inventory: InventoryRepository;
  createAuditEvent: (params: {
    targetUserId: string;
    type: string;
    metadata?: Record<string, unknown>;
  }) => Promise<void>;
};

export async function claimQuestReward(
  userId: string,
  input: ClaimQuestRewardInput,
  deps: ClaimDeps,
): Promise<ClaimQuestRewardResult> {
  const quest = await deps.quests.findById(userId, input.questId);

  if (!quest) {
    return { status: "not_found" };
  }

  if (quest.status === "claimed") {
    return { status: "already_claimed" };
  }

  if (quest.status !== "completed") {
    return { status: "quest_not_completed" };
  }

  const def = QUEST_DEFINITIONS.find((d) => d.key === quest.questKey);
  const rewardType = def?.rewardType ?? quest.rewardPowerUp;
  const rewardQuantity = def?.rewardQuantity ?? 1;

  const { row: inventoryRow } = await deps.inventory.increment(userId, rewardType, rewardQuantity);

  await deps.quests.updateStatus(userId, quest.id, "claimed", rewardType);

  await deps.createAuditEvent({
    targetUserId: userId,
    type: "quest_reward_grant",
    metadata: {
      questId: quest.id,
      questKey: quest.questKey,
      rewardType,
      rewardQuantity,
      capped: inventoryRow.quantity < rewardQuantity,
    },
  });

  const inventory = await deps.inventory.findByUser(userId);

  return {
    status: "ok",
    quest: buildQuestView({ ...quest, status: "claimed", rewardPowerUp: rewardType }),
    inventory,
  };
}
