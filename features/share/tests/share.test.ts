import { describe, expect, test } from "bun:test";
import { createShareSnapshotWithDependencies } from "../application/create-snapshot";
import { softDeleteShareSnapshotWithDependencies } from "../application/delete-snapshot";
import { getPublicShareSnapshotWithDependencies } from "../application/get-public-snapshot";
import type { ShareDependencies } from "../application/ports";
import {
  createPublicShareId,
  isPublicShareId,
  toPublicShareSnapshot,
  type ShareSnapshotProjectionRow,
} from "@/features/share";

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

describe("share use cases", () => {
  test("creates snapshots through the repository port", async () => {
    const dependencies = createFakeDependencies();

    const result = await createShareSnapshotWithDependencies("user-1", dependencies);

    expect(result.status).toBe("ok");
    expect(result.url).toBe(`https://devine.test/share/${result.publicId}`);
    expect(dependencies.createdSnapshots[0]).toMatchObject({
      publicId: result.publicId,
      userId: "user-1",
      dailyPetSnapshotId: null,
      seniorityLevel: "code_monkey",
      healthState: "stable",
    });
  });

  test("loads public snapshots through the repository port", async () => {
    const dependencies = createFakeDependencies({
      snapshots: [makeShareSnapshotRecord()],
    });

    const result = await getPublicShareSnapshotWithDependencies("devine_public123", dependencies);

    expect(result).toMatchObject({
      status: "ok",
      snapshot: {
        publicId: "devine_public123",
        topTags: ["architecture", "ai", "security"],
      },
    });
  });

  test("reports deleted snapshots without projecting them", async () => {
    const dependencies = createFakeDependencies({
      snapshots: [makeShareSnapshotRecord({ deletedAt: new Date("2026-05-23T13:00:00.000Z") })],
    });

    const result = await getPublicShareSnapshotWithDependencies("devine_public123", dependencies);

    expect(result).toEqual({ status: "deleted" });
  });

  test("soft deletes snapshots through the repository port", async () => {
    const dependencies = createFakeDependencies({ deleteResult: "deleted" });

    const result = await softDeleteShareSnapshotWithDependencies(
      "user-1",
      "devine_public123",
      dependencies,
    );

    expect(result).toEqual({ status: "deleted" });
    expect(dependencies.deleteRequests).toEqual([
      { publicId: "devine_public123", userId: "user-1" },
    ]);
  });
});

type ShareSnapshotRecord = ShareSnapshotProjectionRow & {
  deletedAt: Date | null;
};

type FakeDependencies = ShareDependencies & {
  createdSnapshots: Parameters<ShareDependencies["snapshots"]["create"]>[0][];
  deleteRequests: { publicId: string; userId: string }[];
};

function makeShareSnapshotRecord(
  overrides: Partial<ShareSnapshotRecord> = {},
): ShareSnapshotRecord {
  return {
    ...makeShareSnapshotRow(),
    deletedAt: null,
    ...overrides,
  };
}

function createFakeDependencies(
  input: {
    snapshots?: ShareSnapshotRecord[];
    deleteResult?: "deleted" | "not_found";
  } = {},
): FakeDependencies {
  const createdSnapshots: Parameters<ShareDependencies["snapshots"]["create"]>[0][] = [];
  const deleteRequests: { publicId: string; userId: string }[] = [];

  return {
    createdSnapshots,
    deleteRequests,
    snapshots: {
      async create(snapshot): Promise<void> {
        createdSnapshots.push(snapshot);
      },
      async findByPublicId(publicId: string): Promise<ShareSnapshotRecord | null> {
        return input.snapshots?.find((snapshot) => snapshot.publicId === publicId) ?? null;
      },
      async softDeleteForOwner(publicId: string, userId: string): Promise<"deleted" | "not_found"> {
        deleteRequests.push({ publicId, userId });
        return input.deleteResult ?? "not_found";
      },
    },
    getPublicAppUrl(): string {
      return "https://devine.test";
    },
  };
}
