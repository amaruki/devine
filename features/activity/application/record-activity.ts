import { DAILY_CAPS, ENERGY_VALUES } from "@/features/scoring";
import type { ActivityEventDraft, ActivityInput, RecordActivityResult } from "../domain/types";
import type { ActivityDependencies } from "./ports";

export async function recordActivityWithDependencies(
  userId: string,
  input: ActivityInput,
  deps: ActivityDependencies,
): Promise<RecordActivityResult> {
  if (!["read", "upvote", "bookmark", "comment", "share"].includes(input.type)) {
    return { status: "invalid", reason: `Unknown activity type: ${input.type}` };
  }

  // Idempotency check via client-generated key
  if (input.idempotencyKey) {
    const existing = await deps.events.findByIdempotencyKey(userId, input.idempotencyKey);
    if (existing) return { status: "duplicate", event: existing };
  }

  // Deduplication via daily.dev event ID
  if (input.dailydevEventId) {
    const existing = await deps.events.findByDailydevEventId(userId, input.dailydevEventId);
    if (existing) return { status: "duplicate", event: existing };
  }

  // Compute energy with daily cap awareness
  const todayStart = startOfDay(input.occurredAt ?? new Date());
  const todayEnd = endOfDay(input.occurredAt ?? new Date());
  const todayEvents = await deps.events.findByUserAndDateRange(userId, todayStart, todayEnd);

  const countToday = todayEvents.filter((e) => e.type === input.type).length;
  const cap = DAILY_CAPS[input.type] ?? 0;
  const perEventEnergy = ENERGY_VALUES[input.type] ?? 0;
  const energyEarned = countToday < cap ? perEventEnergy : 0;

  const draft: ActivityEventDraft = {
    userId,
    type: input.type,
    source: input.source,
    idempotencyKey: input.idempotencyKey ?? null,
    dailydevEventId: input.dailydevEventId ?? null,
    dailyDevPostId: input.post?.id ?? null,
    postTitle: input.post?.title ?? null,
    postUrl: input.post?.url ?? null,
    tags: input.post?.tags ?? [],
    energyEarned,
    occurredAt: input.occurredAt ?? new Date(),
    metadata: {},
  };

  const event = await deps.events.create(draft);
  return { status: "ok", event };
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}
