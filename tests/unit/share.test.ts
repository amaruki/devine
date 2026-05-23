import { describe, expect, test } from "bun:test";
import { createPublicShareId, isPublicShareId } from "@/lib/share/public-id";
import { toPublicShareSnapshot } from "@/lib/share/public-projection";
import type { ShareSnapshotProjectionRow } from "@/lib/share/public-projection";

function makeShareSnapshotRow(
  overrides: Partial<ShareSnapshotProjectionRow> = {},
): ShareSnapshotProjectionRow {
  return {
    publicId: "devine_public123",
    seniorityLevel: "grounded_scholar",
    seniorityScore: 67,
    healthState: "stable",
    topTags: ["architecture", "ai", "security", "private-overflow"],
    speechBubble: "My duck stopped saying it works on my machine this week.",
    generatedAt: new Date("2026-05-23T12:00:00.000Z"),
    ...overrides,
  };
}

describe("share public projection", () => {
  test("returns only privacy-safe public fields", () => {
    const projection = toPublicShareSnapshot(makeShareSnapshotRow());

    expect(projection).toEqual({
      publicId: "devine_public123",
      seniorityLevel: "grounded_scholar",
      seniorityScore: 67,
      healthState: "stable",
      topTags: ["architecture", "ai", "security"],
      speechBubble: "My duck stopped saying it works on my machine this week.",
      generatedAt: "2026-05-23T12:00:00.000Z",
    });
    expect(Object.keys(projection)).not.toContain("userId");
    expect(Object.keys(projection)).not.toContain("dailyPetSnapshotId");
    expect(Object.keys(projection)).not.toContain("id");
  });

  test("rejects invalid public state persisted in a row", () => {
    expect(() => toPublicShareSnapshot(makeShareSnapshotRow({ healthState: "dead" }))).toThrow(
      "Share snapshot contains invalid public state",
    );
  });
});

describe("share public IDs", () => {
  test("generates URL-safe prefixed IDs", () => {
    const publicId = createPublicShareId();

    expect(publicId.startsWith("devine_")).toBe(true);
    expect(isPublicShareId(publicId)).toBe(true);
  });

  test("rejects non-share IDs", () => {
    expect(isPublicShareId("31ec44d1-6db9-4387-bf4e-565803de0dd7")).toBe(false);
    expect(isPublicShareId("devine_has space")).toBe(false);
  });
});
