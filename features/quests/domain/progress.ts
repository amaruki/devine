import type { ActivityType } from "@/features/activity";
import type { QuestConfig, QuestProgress, QuestView, QuestRow, QuestStatus } from "./types";
import { getQuestDefinition, getTodayDateScope, getWeekScope } from "./config";

export type ActivityEventForQuest = {
  type: string;
  occurredAt: Date;
};

export type ScoreBreakdownForQuest = {
  readingConsistency: number;
  topicVariety: number;
  curation: number;
  discussion: number;
  socialContribution: number;
  deepTechSignals: number;
};

export function calculateQuestProgress(
  config: QuestConfig,
  events: ActivityEventForQuest[],
): QuestProgress {
  const matchingEvents = events.filter((e) =>
    config.progressEvents.includes(e.type as ActivityType),
  );
  return {
    key: config.key,
    progress: matchingEvents.length,
    target: config.target,
  };
}

export function determineQuestStatus(
  progress: number,
  target: number,
  currentStatus: QuestStatus,
): QuestStatus {
  if (currentStatus === "claimed") {
    return "claimed";
  }
  if (progress >= target) {
    return "completed";
  }
  return "active";
}

export function generatePersonalizedQuest(
  scoreBreakdown: ScoreBreakdownForQuest,
): QuestConfig | null {
  const components: { key: keyof ScoreBreakdownForQuest; value: number }[] = [
    { key: "readingConsistency", value: scoreBreakdown.readingConsistency },
    { key: "topicVariety", value: scoreBreakdown.topicVariety },
    { key: "curation", value: scoreBreakdown.curation },
    { key: "discussion", value: scoreBreakdown.discussion },
    { key: "socialContribution", value: scoreBreakdown.socialContribution },
    { key: "deepTechSignals", value: scoreBreakdown.deepTechSignals },
  ];

  components.sort((a, b) => a.value - b.value);

  const weakest = components[0];
  if (!weakest) return null;

  return createPersonalizedConfig(weakest.key);
}

function createPersonalizedConfig(weakestArea: keyof ScoreBreakdownForQuest): QuestConfig {
  const configs: Record<keyof ScoreBreakdownForQuest, QuestConfig> = {
    readingConsistency: {
      key: "weakest_area",
      type: "personalized",
      title: "Boost Your Reading",
      description: "Read 2 more articles to improve consistency",
      progressEvents: ["read"],
      rewardType: "snack",
      rewardQuantity: 1,
      target: 2,
      resetCadence: "daily",
    },
    topicVariety: {
      key: "weakest_area",
      type: "personalized",
      title: "Expand Your Horizons",
      description: "Explore articles from different tags",
      progressEvents: ["read"],
      rewardType: "knowledge_gem",
      rewardQuantity: 1,
      target: 3,
      resetCadence: "daily",
    },
    curation: {
      key: "weakest_area",
      type: "personalized",
      title: "Curate Your Learning",
      description: "Bookmark 2 articles for future reference",
      progressEvents: ["bookmark"],
      rewardType: "snack",
      rewardQuantity: 1,
      target: 2,
      resetCadence: "daily",
    },
    discussion: {
      key: "weakest_area",
      type: "personalized",
      title: "Join the Conversation",
      description: "Comment on 2 posts to engage with the community",
      progressEvents: ["comment"],
      rewardType: "social_boost",
      rewardQuantity: 1,
      target: 2,
      resetCadence: "daily",
    },
    socialContribution: {
      key: "weakest_area",
      type: "personalized",
      title: "Share Knowledge",
      description: "Share 2 articles with your network",
      progressEvents: ["share"],
      rewardType: "social_boost",
      rewardQuantity: 1,
      target: 2,
      resetCadence: "daily",
    },
    deepTechSignals: {
      key: "weakest_area",
      type: "personalized",
      title: "Go Deep",
      description: "Read articles with advanced tech tags",
      progressEvents: ["read"],
      rewardType: "knowledge_gem",
      rewardQuantity: 1,
      target: 2,
      resetCadence: "daily",
    },
  };

  return configs[weakestArea];
}

export function shouldResetQuest(row: QuestRow, _now: Date): boolean {
  const config = getQuestDefinition(row.questKey);
  if (!config) return false;

  if (config.resetCadence === "daily") {
    return row.dateScope !== getTodayDateScope();
  }

  if (config.resetCadence === "weekly") {
    return row.dateScope !== getWeekScope();
  }

  return false;
}

export function buildQuestView(row: QuestRow): QuestView {
  const config = getQuestDefinition(row.questKey);
  return {
    id: row.id,
    key: row.questKey,
    type: row.type,
    title: config?.title ?? row.questKey,
    description: config?.description ?? "",
    status: row.status,
    progress: row.progress,
    target: row.target,
    rewardType: row.rewardPowerUp,
    rewardQuantity: config?.rewardQuantity ?? 1,
    dateScope: row.dateScope,
  };
}

export function buildQuestViewFromConfig(
  config: QuestConfig,
  progress: number,
  dateScope: string,
): QuestView {
  const status = progress >= config.target ? "completed" : "active";
  return {
    id: `pending-${config.key}`,
    key: config.key,
    type: config.type,
    title: config.title,
    description: config.description,
    status,
    progress,
    target: config.target,
    rewardType: config.rewardType,
    rewardQuantity: config.rewardQuantity,
    dateScope,
  };
}
