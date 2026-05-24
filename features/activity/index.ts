export type ActivityType = "read" | "upvote" | "bookmark" | "comment" | "share";
export type ActivitySource = "dailydev_api" | "in_app" | "manual" | "demo";

export type {
  ActivityEvent,
  ActivityEventDraft,
  ActivityInput,
  RecordActivityResult,
} from "./domain/types";
export type { ActivityDependencies, ActivityEventRepository } from "./application/ports";
export { recordActivityWithDependencies } from "./application/record-activity";
