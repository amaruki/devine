import { describe, expect, test } from "bun:test";
import { processMissedDays } from "@/features/scoring";

describe("processMissedDays", () => {
  test("returns unchanged health when last snapshot is today", () => {
    const today = new Date("2026-05-24T10:00:00Z");
    const lastSnapshot = new Date("2026-05-24T08:00:00Z");
    const result = processMissedDays(62, lastSnapshot, today);
    expect(result.health).toBe(62);
    expect(result.missedDays).toBe(0);
  });

  test("returns unchanged health when last snapshot was yesterday", () => {
    const today = new Date("2026-05-24T10:00:00Z");
    const lastSnapshot = new Date("2026-05-23T22:00:00Z");
    const result = processMissedDays(62, lastSnapshot, today);
    expect(result.health).toBe(62);
    expect(result.missedDays).toBe(0);
  });

  test("applies -20 per missed day", () => {
    const today = new Date("2026-05-24T10:00:00Z");
    const lastSnapshot = new Date("2026-05-21T10:00:00Z"); // 3 days ago
    // daysElapsed = 3, missedDays = 3 - 1 = 2
    const result = processMissedDays(62, lastSnapshot, today);
    expect(result.missedDays).toBe(2);
    expect(result.health).toBe(22); // 62 - 2*20 = 22
  });

  test("applies -20 for each missed day over a week", () => {
    const today = new Date("2026-05-24T10:00:00Z");
    const lastSnapshot = new Date("2026-05-17T10:00:00Z"); // 7 days ago
    // daysElapsed = 7, missedDays = 7 - 1 = 6
    const result = processMissedDays(100, lastSnapshot, today);
    expect(result.missedDays).toBe(6);
    expect(result.health).toBe(0); // 100 - 6*20 = -20, clamped to 0
  });

  test("clamps health at 0", () => {
    const today = new Date("2026-05-24T10:00:00Z");
    const lastSnapshot = new Date("2026-05-19T10:00:00Z"); // 5 days ago
    // daysElapsed = 5, missedDays = 4, health = 62 - 4*20 = -18 → 0
    const result = processMissedDays(62, lastSnapshot, today);
    expect(result.missedDays).toBe(4);
    expect(result.health).toBe(0);
  });

  test("returns unchanged health for new user with no snapshots", () => {
    const today = new Date("2026-05-24T10:00:00Z");
    const result = processMissedDays(62, null, today);
    expect(result.health).toBe(62);
    expect(result.missedDays).toBe(0);
  });

  test("handles same date in different timezones", () => {
    const today = new Date("2026-05-24T23:00:00Z");
    const lastSnapshot = new Date("2026-05-24T01:00:00Z");
    const result = processMissedDays(62, lastSnapshot, today);
    expect(result.health).toBe(62);
    expect(result.missedDays).toBe(0);
  });
});
