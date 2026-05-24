import type { activityEvents } from "@/lib/db/schema";

export type ActivityType = "read" | "upvote" | "bookmark" | "comment" | "share";
export type ActivitySource = "dailydev_api" | "in_app" | "manual" | "demo";

export type ActivityEvent = typeof activityEvents.$inferSelect;

export type ActivityEventDraft = typeof activityEvents.$inferInsert;

export type ActivityInput = {
  type: ActivityType;
  source: ActivitySource;
  idempotencyKey?: string;
  dailydevEventId?: string;
  post?: {
    id?: string;
    title?: string;
    url?: string;
    tags?: string[];
  };
  occurredAt?: Date;
};

export type RecordActivityResult =
  | { status: "ok"; event: ActivityEvent }
  | { status: "duplicate"; event: ActivityEvent }
  | { status: "invalid"; reason: string };
