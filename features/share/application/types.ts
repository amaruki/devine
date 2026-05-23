import type { HealthState, SeniorityLevel } from "@/features/scoring";

export type PublicShareSnapshot = {
  publicId: string;
  seniorityLevel: SeniorityLevel;
  seniorityScore: number;
  healthState: HealthState;
  topTags: string[];
  speechBubble: string;
  generatedAt: string;
};

export type CreateShareSnapshotResult = {
  status: "ok";
  publicId: string;
  url: string;
};

export type GetPublicShareSnapshotResult =
  | {
      status: "ok";
      snapshot: PublicShareSnapshot;
    }
  | {
      status: "not_found";
    }
  | {
      status: "deleted";
    };

export type DeleteShareSnapshotResult =
  | {
      status: "deleted";
    }
  | {
      status: "not_found";
    };

export type ShareSnapshotDraft = {
  seniorityLevel: SeniorityLevel;
  seniorityScore: number;
  healthState: HealthState;
  topTags: string[];
  speechBubble: string;
  generatedAt: Date;
};
