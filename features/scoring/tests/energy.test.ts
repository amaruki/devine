import { describe, expect, test } from "bun:test";
import { calculateDailyEnergy } from "@/features/scoring";

describe("calculateDailyEnergy", () => {
  test("returns zero for no events", () => {
    const result = calculateDailyEnergy([]);
    expect(result.total).toBe(0);
    expect(result.capped).toBe(false);
  });

  test("sums energy for single read event", () => {
    const result = calculateDailyEnergy([{ type: "read", energyEarned: 10 }]);
    expect(result.total).toBe(10);
    expect(result.byType.read).toBe(10);
    expect(result.capped).toBe(false);
  });

  test("caps reads at 5 per day (50 energy)", () => {
    const events = Array.from({ length: 6 }, () => ({ type: "read", energyEarned: 10 }));
    const result = calculateDailyEnergy(events);
    expect(result.byType.read).toBe(50);
    expect(result.capped).toBe(true);
  });

  test("caps upvotes at 10 per day (30 energy)", () => {
    const events = Array.from({ length: 12 }, () => ({ type: "upvote", energyEarned: 3 }));
    const result = calculateDailyEnergy(events);
    expect(result.byType.upvote).toBe(30);
    expect(result.capped).toBe(true);
  });

  test("caps bookmarks at 5 per day (25 energy)", () => {
    const events = Array.from({ length: 7 }, () => ({ type: "bookmark", energyEarned: 5 }));
    const result = calculateDailyEnergy(events);
    expect(result.byType.bookmark).toBe(25);
    expect(result.capped).toBe(true);
  });

  test("caps comments at 3 per day (45 energy)", () => {
    const events = Array.from({ length: 5 }, () => ({ type: "comment", energyEarned: 15 }));
    const result = calculateDailyEnergy(events);
    expect(result.byType.comment).toBe(45);
    expect(result.capped).toBe(true);
  });

  test("caps shares at 3 per day (36 energy)", () => {
    const events = Array.from({ length: 5 }, () => ({ type: "share", energyEarned: 12 }));
    const result = calculateDailyEnergy(events);
    expect(result.byType.share).toBe(36);
    expect(result.capped).toBe(true);
  });

  test("mixes multiple types correctly", () => {
    const events = [
      { type: "read", energyEarned: 10 },
      { type: "read", energyEarned: 10 },
      { type: "upvote", energyEarned: 3 },
      { type: "bookmark", energyEarned: 5 },
      { type: "comment", energyEarned: 15 },
    ];
    const result = calculateDailyEnergy(events);
    expect(result.total).toBe(43); // 20 + 3 + 5 + 15
    expect(result.byType.read).toBe(20);
    expect(result.byType.upvote).toBe(3);
    expect(result.byType.bookmark).toBe(5);
    expect(result.byType.comment).toBe(15);
    expect(result.byType.share).toBe(0);
  });

  test("handles unknown event types gracefully", () => {
    const result = calculateDailyEnergy([{ type: "read", energyEarned: 10 }]);
    expect(result.total).toBe(10);
  });
});
