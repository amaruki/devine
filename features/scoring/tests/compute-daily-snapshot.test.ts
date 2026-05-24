import { describe, expect, test } from "bun:test";
import { computeDailySnapshot } from "@/features/scoring";

describe("computeDailySnapshot", () => {
  const today = new Date("2026-05-24T10:00:00Z");

  test("returns default state for new user with no events", () => {
    const result = computeDailySnapshot({
      todayEvents: [],
      sevenDayEvents: [],
      previousHealth: 62,
      lastSnapshotDate: null,
      today,
    });

    expect(result.energyEarned).toBe(0);
    expect(result.health).toBe(42); // 62 starting, 0 energy = -20
    expect(result.healthState).toBe("tired");
    expect(result.seniorityScore).toBe(0);
    expect(result.seniorityLevel).toBe("ignorant_copaster");
  });

  test("processes missed days before computing health", () => {
    const lastSnapshotDate = new Date("2026-05-20T10:00:00Z"); // 4 days ago = 3 missed
    const result = computeDailySnapshot({
      todayEvents: [{ type: "read", energyEarned: 10, tags: ["architecture"], occurredAt: today }],
      sevenDayEvents: [{ type: "read", tags: ["architecture"], occurredAt: today }],
      previousHealth: 62,
      lastSnapshotDate,
      today,
    });

    // Missed 3 days: 62 - 3*20 = 2, energy is 10 which is in the 10-29 range = -8 health
    // 2 + (-8) = -6, clamped to 0
    expect(result.health).toBe(0);
    expect(result.healthState).toBe("hibernating");
  });

  test("computes full snapshot with health and seniority from mixed activity", () => {
    const lastSnapshotDate = new Date("2026-05-23T10:00:00Z"); // yesterday = 0 missed

    const todayEvents = [
      { type: "read", energyEarned: 10, tags: ["architecture"], occurredAt: today },
      { type: "read", energyEarned: 10, tags: ["database"], occurredAt: today },
      { type: "read", energyEarned: 10, tags: ["security"], occurredAt: today },
      { type: "read", energyEarned: 10, tags: ["performance"], occurredAt: today },
      { type: "read", energyEarned: 10, tags: ["observability"], occurredAt: today },
      { type: "bookmark", energyEarned: 5, tags: ["distributed-systems"], occurredAt: today },
      { type: "bookmark", energyEarned: 5, tags: ["ai"], occurredAt: today },
      { type: "upvote", energyEarned: 3, tags: ["cloud"], occurredAt: today },
    ];

    const sevenDayEvents = todayEvents.map(({ energyEarned: _, ...rest }) => rest);

    const result = computeDailySnapshot({
      todayEvents,
      sevenDayEvents,
      previousHealth: 62,
      lastSnapshotDate,
      today,
    });

    expect(result.energyEarned).toBe(63); // 5 reads (50) + 2 bookmarks (10) + 1 upvote (3)
    expect(result.energyEarned).toBeGreaterThanOrEqual(50); // met target

    // 0 missed days, energy >= 50 → +5 health: 62+5 = 67
    expect(result.health).toBe(67);
    expect(result.healthState).toBe("stable");

    expect(result.seniorityScore).toBeGreaterThan(0);
    expect(result.scoreBreakdown.readingConsistency).toBeGreaterThan(0);
    expect(result.scoreBreakdown.topicVariety).toBeGreaterThan(0);
    expect(result.scoreBreakdown.curation).toBeGreaterThan(0);
    expect(result.scoreBreakdown.deepTechSignals).toBeGreaterThan(0);
  });

  test("health decreases when energy is below 30", () => {
    const lastSnapshotDate = new Date("2026-05-23T10:00:00Z");
    const todayEvents = [
      { type: "upvote", energyEarned: 3, tags: ["programming"], occurredAt: today },
      { type: "upvote", energyEarned: 3, tags: ["frontend"], occurredAt: today },
    ];

    const result = computeDailySnapshot({
      todayEvents,
      sevenDayEvents: todayEvents.map(({ energyEarned: _, ...rest }) => rest),
      previousHealth: 50,
      lastSnapshotDate,
      today,
    });

    expect(result.energyEarned).toBe(6);
    // 1-9 range = -12, 50 - 12 = 38
    expect(result.health).toBe(38);
    expect(result.healthState).toBe("sick");
  });
});
