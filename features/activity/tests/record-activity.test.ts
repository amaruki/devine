import { describe, expect, test } from "bun:test";
import { recordActivityWithDependencies } from "@/features/activity";
import type {
  ActivityDependencies,
  ActivityEvent,
  ActivityEventDraft,
  ActivityInput,
} from "@/features/activity";

function createFakeDependencies(): ActivityDependencies & { state: { events: ActivityEvent[] } } {
  const state: { events: ActivityEvent[] } = { events: [] };

  return {
    state,
    events: {
      async create(draft: ActivityEventDraft): Promise<ActivityEvent> {
        const event: ActivityEvent = {
          id: crypto.randomUUID(),
          userId: draft.userId ?? "",
          type: draft.type ?? "read",
          source: draft.source ?? "demo",
          idempotencyKey: draft.idempotencyKey ?? null,
          dailydevEventId: draft.dailydevEventId ?? null,
          dailyDevPostId: draft.dailyDevPostId ?? null,
          postTitle: draft.postTitle ?? null,
          postUrl: draft.postUrl ?? null,
          tags: (draft.tags as string[]) ?? [],
          energyEarned: draft.energyEarned ?? 0,
          occurredAt: draft.occurredAt ?? new Date(),
          metadata: (draft.metadata as Record<string, unknown>) ?? {},
          createdAt: new Date(),
        };
        state.events.push(event);
        return event;
      },

      async findByIdempotencyKey(userId: string, key: string): Promise<ActivityEvent | null> {
        if (!key) return null;
        return state.events.find((e) => e.userId === userId && e.idempotencyKey === key) ?? null;
      },

      async findByDailydevEventId(userId: string, eventId: string): Promise<ActivityEvent | null> {
        if (!eventId) return null;
        return (
          state.events.find((e) => e.userId === userId && e.dailydevEventId === eventId) ?? null
        );
      },

      async findByUserAndDateRange(userId: string, from: Date, to: Date): Promise<ActivityEvent[]> {
        return state.events.filter(
          (e) => e.userId === userId && e.occurredAt >= from && e.occurredAt <= to,
        );
      },
    },
  };
}

describe("recordActivity", () => {
  test("records a valid read event and returns ok", async () => {
    const deps = createFakeDependencies();
    const input: ActivityInput = {
      type: "read",
      source: "demo",
      idempotencyKey: "key-1",
      occurredAt: new Date(),
    };

    const result = await recordActivityWithDependencies("user-1", input, deps);

    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.event.type).toBe("read");
      expect(result.event.energyEarned).toBe(10);
      expect(result.event.source).toBe("demo");
    }
    expect(deps.state.events).toHaveLength(1);
  });

  test("returns duplicate for repeated idempotency key", async () => {
    const deps = createFakeDependencies();
    const input: ActivityInput = {
      type: "read",
      source: "demo",
      idempotencyKey: "key-dup",
      occurredAt: new Date(),
    };

    const first = await recordActivityWithDependencies("user-1", input, deps);
    expect(first.status).toBe("ok");

    const second = await recordActivityWithDependencies("user-1", input, deps);
    expect(second.status).toBe("duplicate");
    if (second.status === "duplicate") {
      expect(second.event.idempotencyKey).toBe("key-dup");
    }

    // Only one event persisted
    expect(deps.state.events).toHaveLength(1);
  });

  test("returns zero energy when daily cap is reached", async () => {
    const deps = createFakeDependencies();
    const now = new Date();

    // Record 5 reads (the cap)
    for (let i = 1; i <= 5; i++) {
      const result = await recordActivityWithDependencies(
        "user-1",
        {
          type: "read",
          source: "demo",
          idempotencyKey: `key-${i}`,
          occurredAt: now,
        },
        deps,
      );
      if (result.status === "ok") {
        expect(result.event.energyEarned).toBe(10);
      }
    }

    // 6th read should have 0 energy
    const sixth = await recordActivityWithDependencies(
      "user-1",
      {
        type: "read",
        source: "demo",
        idempotencyKey: "key-6",
        occurredAt: now,
      },
      deps,
    );
    expect(sixth.status).toBe("ok");
    if (sixth.status === "ok") {
      expect(sixth.event.energyEarned).toBe(0);
    }

    expect(deps.state.events).toHaveLength(6);
  });

  test("rejects invalid activity type", async () => {
    const deps = createFakeDependencies();
    const result = await recordActivityWithDependencies(
      "user-1",
      {
        type: "invalid" as "read",
        source: "demo",
        occurredAt: new Date(),
      },
      deps,
    );

    expect(result.status).toBe("invalid");
    if (result.status === "invalid") {
      expect(result.reason).toContain("Unknown activity type");
    }
  });

  test("deduplicates by dailydev event ID", async () => {
    const deps = createFakeDependencies();
    const input: ActivityInput = {
      type: "upvote",
      source: "dailydev_api",
      dailydevEventId: "evt_42",
      occurredAt: new Date(),
    };

    const first = await recordActivityWithDependencies("user-1", input, deps);
    expect(first.status).toBe("ok");

    const second = await recordActivityWithDependencies("user-1", input, deps);
    expect(second.status).toBe("duplicate");
    expect(deps.state.events).toHaveLength(1);
  });

  test("different users can share the same idempotency key", async () => {
    const deps = createFakeDependencies();
    const input: ActivityInput = {
      type: "read",
      source: "demo",
      idempotencyKey: "shared-key",
      occurredAt: new Date(),
    };

    const first = await recordActivityWithDependencies("user-1", input, deps);
    const second = await recordActivityWithDependencies("user-2", input, deps);

    expect(first.status).toBe("ok");
    expect(second.status).toBe("ok");
    expect(deps.state.events).toHaveLength(2);
  });
});
