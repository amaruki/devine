import type { QuestConfig, PowerUpType } from "./types";

export const QUEST_DEFINITIONS: QuestConfig[] = [
  {
    key: "feed_the_duck",
    type: "daily",
    title: "Feed the Duck",
    description: "Read 3 articles today",
    progressEvents: ["read"],
    rewardType: "snack",
    rewardQuantity: 1,
    target: 3,
    resetCadence: "daily",
  },
  {
    key: "future_you_bookmark",
    type: "daily",
    title: "Future-You Bookmark",
    description: "Bookmark 1 article for later",
    progressEvents: ["bookmark"],
    rewardType: "snack",
    rewardQuantity: 1,
    target: 1,
    resetCadence: "daily",
  },
  {
    key: "touch_grass_but_online",
    type: "daily",
    title: "Touch Grass, But Online",
    description: "Share 1 article with others",
    progressEvents: ["share"],
    rewardType: "snack",
    rewardQuantity: 1,
    target: 1,
    resetCadence: "daily",
  },
  {
    key: "five_day_streak",
    type: "weekly",
    title: "Five-Day Learning Streak",
    description: "Earn energy on 5 different days this week",
    progressEvents: ["read", "upvote", "bookmark", "comment", "share"],
    rewardType: "medicine",
    rewardQuantity: 1,
    target: 5,
    resetCadence: "weekly",
  },
];

export const POWER_UP_MAX_HELD: Record<PowerUpType, number> = {
  snack: 5,
  medicine: 3,
  knowledge_gem: 2,
  social_boost: 2,
  revive_feather: 1,
};

export const POWER_UP_EFFECTS: Record<
  PowerUpType,
  { effect: "energy" | "health" | "multiplier"; value: number }
> = {
  snack: { effect: "energy", value: 10 },
  medicine: { effect: "health", value: 15 },
  knowledge_gem: { effect: "multiplier", value: 2 },
  social_boost: { effect: "multiplier", value: 2 },
  revive_feather: { effect: "health", value: 35 },
};

export function getDailyQuestDefinitions(): QuestConfig[] {
  return QUEST_DEFINITIONS.filter((q) => q.type === "daily");
}

export function getWeeklyQuestDefinitions(): QuestConfig[] {
  return QUEST_DEFINITIONS.filter((q) => q.type === "weekly");
}

export function getQuestDefinition(key: string): QuestConfig | undefined {
  return QUEST_DEFINITIONS.find((q) => q.key === key);
}

export function getTodayDateScope(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getWeekScope(): string {
  const now = new Date();
  const startOfWeek = new Date(now);
  const day = startOfWeek.getUTCDay();
  const diff = startOfWeek.getUTCDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setUTCDate(diff);
  return startOfWeek.toISOString().slice(0, 10);
}
