import type { ActivityEvent, ActivityEventDraft } from "../domain/types";

export type ActivityEventRepository = {
  create(draft: ActivityEventDraft): Promise<ActivityEvent>;
  findByIdempotencyKey(userId: string, key: string): Promise<ActivityEvent | null>;
  findByDailydevEventId(userId: string, eventId: string): Promise<ActivityEvent | null>;
  findByUserAndDateRange(userId: string, from: Date, to: Date): Promise<ActivityEvent[]>;
};

export type ActivityDependencies = {
  events: ActivityEventRepository;
};
