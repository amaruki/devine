import { describe, expect, test } from "bun:test";
import { calculateSeniorityScore, scoreToLevel } from "@/features/scoring";

describe("calculateSeniorityScore", () => {
  test("returns zero score for no events", () => {
    const result = calculateSeniorityScore([]);
    expect(result.score).toBe(0);
    expect(result.level).toBe("ignorant_copaster");
  });

  test("scores reading consistency from a single read", () => {
    const now = new Date();
    const result = calculateSeniorityScore([
      { type: "read", tags: ["architecture"], occurredAt: now },
    ]);
    // 1 day out of 7 = (1/7)*30 ≈ 4
    expect(result.breakdown.readingConsistency).toBe(4);
    expect(result.score).toBeGreaterThan(0);
  });

  test("scores full reading consistency from 7 days of reads", () => {
    const events = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      events.push({ type: "read", tags: ["programming"], occurredAt: date });
    }
    const result = calculateSeniorityScore(events);
    expect(result.breakdown.readingConsistency).toBe(30);
  });

  test("scores curation from bookmarks and upvotes", () => {
    const today = new Date();
    const events = [];
    for (let i = 0; i < 10; i++) {
      events.push({ type: "bookmark", tags: [], occurredAt: today });
    }
    const result = calculateSeniorityScore(events);
    expect(result.breakdown.curation).toBe(20);
  });

  test("scores deep tech signals", () => {
    const today = new Date();
    const events = [];
    for (let i = 0; i < 5; i++) {
      events.push({ type: "read", tags: ["architecture"], occurredAt: today });
    }
    const result = calculateSeniorityScore(events);
    expect(result.breakdown.deepTechSignals).toBe(5);
  });

  test("ignores events outside the 7-day window", () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 10);
    const result = calculateSeniorityScore([
      { type: "read", tags: ["architecture"], occurredAt: oldDate },
    ]);
    expect(result.breakdown.readingConsistency).toBe(0);
  });
});

describe("scoreToLevel", () => {
  test("maps scores to levels", () => {
    expect(scoreToLevel(0)).toBe("ignorant_copaster");
    expect(scoreToLevel(24)).toBe("ignorant_copaster");
    expect(scoreToLevel(25)).toBe("code_monkey");
    expect(scoreToLevel(49)).toBe("code_monkey");
    expect(scoreToLevel(50)).toBe("grounded_scholar");
    expect(scoreToLevel(79)).toBe("grounded_scholar");
    expect(scoreToLevel(80)).toBe("tech_philosopher");
    expect(scoreToLevel(100)).toBe("tech_philosopher");
  });
});
