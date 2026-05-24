import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { auditEvents, demoStates } from "@/lib/db/schema";

export type DemoMilestone =
  | "landing_viewed"
  | "login_completed"
  | "demo_mode_entered"
  | "simulation_action_performed"
  | "score_changed"
  | "share_created";

const REQUIRED_MILESTONES: DemoMilestone[] = [
  "landing_viewed",
  "login_completed",
  "demo_mode_entered",
  "simulation_action_performed",
  "score_changed",
  "share_created",
];

function hasAllMilestones(milestones: DemoMilestone[]): boolean {
  return REQUIRED_MILESTONES.every((m) => milestones.includes(m));
}

export async function getDemoMilestones(userId: string): Promise<DemoMilestone[]> {
  const row = await db.query.demoStates.findFirst({
    where: eq(demoStates.userId, userId),
    columns: { state: true },
  });

  if (!row?.state || typeof row.state !== "object") {
    return [];
  }

  const state = row.state as Record<string, unknown>;
  const milestones = state.milestones;
  if (!Array.isArray(milestones)) {
    return [];
  }

  return milestones.filter((m): m is DemoMilestone =>
    REQUIRED_MILESTONES.includes(m as DemoMilestone),
  );
}

export async function recordDemoMilestone(
  userId: string,
  milestone: DemoMilestone,
): Promise<{ isNew: boolean; isComplete: boolean }> {
  const currentMilestones = await getDemoMilestones(userId);

  if (currentMilestones.includes(milestone)) {
    return { isNew: false, isComplete: hasAllMilestones(currentMilestones) };
  }

  const newMilestones = [...currentMilestones, milestone];
  const isComplete = hasAllMilestones(newMilestones);

  await db
    .insert(demoStates)
    .values({
      userId,
      persona: "code_monkey",
      state: { milestones: newMilestones, path: "judge" },
    })
    .onConflictDoUpdate({
      target: demoStates.userId,
      set: {
        state: { milestones: newMilestones, path: "judge" },
        updatedAt: new Date(),
      },
    });

  if (isComplete) {
    await db.insert(auditEvents).values({
      actorUserId: userId,
      targetUserId: userId,
      type: "demo_completed",
      metadata: {
        milestones: newMilestones.join(","),
        completedAt: new Date().toISOString(),
      },
    });
  }

  return { isNew: true, isComplete };
}
