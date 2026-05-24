import { describe, test, expect } from "bun:test";
import {
  calculateQuestProgress,
  determineQuestStatus,
  generatePersonalizedQuest,
  shouldResetQuest,
} from "../domain/progress";
import { QUEST_DEFINITIONS, getTodayDateScope, getWeekScope } from "../domain/config";
import type { QuestConfig, QuestRow } from "../domain/types";
import type { ScoreBreakdown } from "@/features/scoring";

describe("quest progress calculation", () => {
  test("calculates progress from matching events", () => {
    const config: QuestConfig = {
      key: "feed_the_duck",
      type: "daily",
      title: "Feed the Duck",
      description: "Read 3 articles",
      progressEvents: ["read"],
      rewardType: "snack",
      rewardQuantity: 1,
      target: 3,
      resetCadence: "daily",
    };

    const events = [
      { type: "read", occurredAt: new Date() },
      { type: "read", occurredAt: new Date() },
      { type: "upvote", occurredAt: new Date() },
    ];

    const result = calculateQuestProgress(config, events);
    expect(result.progress).toBe(2);
    expect(result.target).toBe(3);
  });

  test("counts only matching event types", () => {
    const config: QuestConfig = {
      key: "future_you_bookmark",
      type: "daily",
      title: "Future-You Bookmark",
      description: "Bookmark 1 article",
      progressEvents: ["bookmark"],
      rewardType: "snack",
      rewardQuantity: 1,
      target: 1,
      resetCadence: "daily",
    };

    const events = [
      { type: "read", occurredAt: new Date() },
      { type: "bookmark", occurredAt: new Date() },
      { type: "read", occurredAt: new Date() },
    ];

    const result = calculateQuestProgress(config, events);
    expect(result.progress).toBe(1);
  });
});

describe("quest status determination", () => {
  test("returns claimed when already claimed", () => {
    const status = determineQuestStatus(5, 3, "claimed");
    expect(status).toBe("claimed");
  });

  test("returns completed when progress meets target", () => {
    const status = determineQuestStatus(3, 3, "active");
    expect(status).toBe("completed");
  });

  test("returns completed when progress exceeds target", () => {
    const status = determineQuestStatus(5, 3, "active");
    expect(status).toBe("completed");
  });

  test("returns active when progress below target", () => {
    const status = determineQuestStatus(1, 3, "active");
    expect(status).toBe("active");
  });

  test("preserves completed status when not claimed", () => {
    const status = determineQuestStatus(3, 3, "completed");
    expect(status).toBe("completed");
  });
});

describe("personalized quest generation", () => {
  test("generates quest for weakest component", () => {
    const breakdown: ScoreBreakdown = {
      readingConsistency: 30,
      topicVariety: 15,
      curation: 25,
      discussion: 20,
      socialContribution: 10,
      deepTechSignals: 5,
    };

    const quest = generatePersonalizedQuest(breakdown);
    expect(quest).not.toBeNull();
    expect(quest?.key).toBe("weakest_area");
    expect(quest?.rewardType).toBe("knowledge_gem");
  });

  test("generates discussion quest for lowest discussion score", () => {
    const breakdown: ScoreBreakdown = {
      readingConsistency: 30,
      topicVariety: 25,
      curation: 20,
      discussion: 5,
      socialContribution: 15,
      deepTechSignals: 10,
    };

    const quest = generatePersonalizedQuest(breakdown);
    expect(quest).not.toBeNull();
    expect(quest?.progressEvents).toContain("comment");
    expect(quest?.rewardType).toBe("social_boost");
  });
});

describe("quest reset logic", () => {
  test("does not reset same-day quest", () => {
    const row: QuestRow = {
      id: "test-id",
      userId: "user-id",
      questKey: "feed_the_duck",
      type: "daily",
      status: "active",
      progress: 1,
      target: 3,
      rewardPowerUp: "snack",
      dateScope: getTodayDateScope(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(shouldResetQuest(row, new Date())).toBe(false);
  });

  test("resets quest from different day", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayScope = yesterday.toISOString().slice(0, 10);

    const row: QuestRow = {
      id: "test-id",
      userId: "user-id",
      questKey: "feed_the_duck",
      type: "daily",
      status: "active",
      progress: 3,
      target: 3,
      rewardPowerUp: "snack",
      dateScope: yesterdayScope,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(shouldResetQuest(row, new Date())).toBe(true);
  });

  test("does not reset weekly quest in same week", () => {
    const row: QuestRow = {
      id: "test-id",
      userId: "user-id",
      questKey: "five_day_streak",
      type: "weekly",
      status: "active",
      progress: 2,
      target: 5,
      rewardPowerUp: "medicine",
      dateScope: getWeekScope(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(shouldResetQuest(row, new Date())).toBe(false);
  });
});

describe("quest definitions", () => {
  test("contains required daily quests", () => {
    const keys = QUEST_DEFINITIONS.map((q) => q.key);
    expect(keys).toContain("feed_the_duck");
    expect(keys).toContain("future_you_bookmark");
    expect(keys).toContain("touch_grass_but_online");
  });

  test("contains weekly quest", () => {
    const weekly = QUEST_DEFINITIONS.filter((q) => q.type === "weekly");
    expect(weekly.length).toBeGreaterThan(0);
    expect(weekly[0]?.key).toBe("five_day_streak");
  });

  test("each quest has valid power-up type", () => {
    const validTypes = ["snack", "medicine", "knowledge_gem", "social_boost", "revive_feather"];
    for (const quest of QUEST_DEFINITIONS) {
      expect(validTypes).toContain(quest.rewardType);
    }
  });
});
