import { and, eq, gte, lte } from "drizzle-orm";
import type { ActivityEventRepository } from "@/features/activity";
import type { ActivityEvent, ActivityEventDraft } from "@/features/activity";
import { db } from "../client";
import { activityEvents } from "../schema";

export const activityEventRepository: ActivityEventRepository = {
  async create(draft: ActivityEventDraft): Promise<ActivityEvent> {
    const rows = await db.insert(activityEvents).values(draft).returning();
    const row = rows[0];
    if (!row) throw new Error("Failed to create activity event");
    return row;
  },

  async findByIdempotencyKey(userId: string, key: string): Promise<ActivityEvent | null> {
    if (!key) return null;
    const row = await db.query.activityEvents.findFirst({
      where: and(eq(activityEvents.userId, userId), eq(activityEvents.idempotencyKey, key)),
    });
    return row ?? null;
  },

  async findByDailydevEventId(userId: string, eventId: string): Promise<ActivityEvent | null> {
    if (!eventId) return null;
    const row = await db.query.activityEvents.findFirst({
      where: and(eq(activityEvents.userId, userId), eq(activityEvents.dailydevEventId, eventId)),
    });
    return row ?? null;
  },

  async findByUserAndDateRange(userId: string, from: Date, to: Date): Promise<ActivityEvent[]> {
    return db.query.activityEvents.findMany({
      where: and(
        eq(activityEvents.userId, userId),
        gte(activityEvents.occurredAt, from),
        lte(activityEvents.occurredAt, to),
      ),
      orderBy: (events, { desc }) => [desc(events.occurredAt)],
    });
  },
};
