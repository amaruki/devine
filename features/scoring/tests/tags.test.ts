import { describe, expect, test } from "bun:test";
import { DEEP_TECH_TAGS, normalizeTag } from "@/features/scoring";

describe("normalizeTag", () => {
  test("trims and lowercases", () => {
    expect(normalizeTag("  Architecture  ")).toBe("architecture");
  });

  test("replaces spaces with hyphens", () => {
    expect(normalizeTag("distributed systems")).toBe("distributed-systems");
  });

  test("maps ml to machine-learning", () => {
    expect(normalizeTag("ml")).toBe("machine-learning");
  });

  test("maps system design to system-design", () => {
    expect(normalizeTag("system design")).toBe("system-design");
  });

  test("maps cybersecurity to security", () => {
    expect(normalizeTag("cybersecurity")).toBe("security");
  });

  test("maps sre to devops", () => {
    expect(normalizeTag("sre")).toBe("devops");
  });

  test("passes through unknown tags lowercased", () => {
    expect(normalizeTag("Web Development")).toBe("web-development");
  });
});

describe("DEEP_TECH_TAGS", () => {
  test("includes the deep tech signal tags", () => {
    expect(DEEP_TECH_TAGS.has("architecture")).toBe(true);
    expect(DEEP_TECH_TAGS.has("system-design")).toBe(true);
    expect(DEEP_TECH_TAGS.has("distributed-systems")).toBe(true);
    expect(DEEP_TECH_TAGS.has("security")).toBe(true);
    expect(DEEP_TECH_TAGS.has("ai")).toBe(true);
    expect(DEEP_TECH_TAGS.has("machine-learning")).toBe(true);
    expect(DEEP_TECH_TAGS.has("devops")).toBe(true);
    expect(DEEP_TECH_TAGS.has("cloud")).toBe(true);
    expect(DEEP_TECH_TAGS.has("database")).toBe(true);
    expect(DEEP_TECH_TAGS.has("performance")).toBe(true);
    expect(DEEP_TECH_TAGS.has("observability")).toBe(true);
  });

  test("does not include non-deep tags", () => {
    expect(DEEP_TECH_TAGS.has("programming")).toBe(false);
    expect(DEEP_TECH_TAGS.has("frontend")).toBe(false);
  });
});
