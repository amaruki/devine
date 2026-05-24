"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "../auth/require-user";
import { recordActivityWithDependencies } from "@/features/activity";
import { calculateDailyEnergy, DAILY_TARGET } from "@/features/scoring";
import type { ActivityInput } from "@/features/activity";

export async function applyDemoDashboardAction(
  action: "read" | "upvote" | "bookmark" | "comment" | "share",
) {
  const user = await requireUser();

  const [{ activityEventRepository }, { findLatestSnapshotByUser }] = await Promise.all([
    import("@/lib/db/repositories/activity"),
    import("@/lib/db/repositories/snapshot"),
  ]);

  const input: ActivityInput = {
    type: action,
    source: "demo",
    idempotencyKey: `demo-${action}-${Date.now()}`,
    post: {
      title: getDemoPostTitle(action),
      tags: getDemoTags(action),
    },
    occurredAt: new Date(),
  };

  const deps = { events: activityEventRepository };
  const result = await recordActivityWithDependencies(user.userId, input, deps);

  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());
  const todayEvents = await activityEventRepository.findByUserAndDateRange(
    user.userId,
    todayStart,
    todayEnd,
  );
  const energy = calculateDailyEnergy(todayEvents);

  const snapshot = await findLatestSnapshotByUser(user.userId);

  revalidatePath("/dashboard");

  return {
    status: result.status,
    action,
    energyEarned: result.status === "ok" ? result.event.energyEarned : 0,
    energyToday: energy.total,
    dailyTarget: DAILY_TARGET,
    healthState: snapshot?.healthState ?? "stable",
    seniorityLevel: snapshot?.seniorityLevel ?? "code_monkey",
  };
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

function getDemoPostTitle(action: string): string {
  const titles: Record<string, string> = {
    read: "Scaling Postgres Queues",
    upvote: "Why Rust is the Future of Systems Programming",
    bookmark: "A Deep Dive into Distributed Consensus",
    comment: "The State of WebAssembly in 2026",
    share: "Building Resilient Microservices",
  };
  return titles[action] ?? "A Developer Article";
}

function getDemoTags(action: string): string[] {
  const tags: Record<string, string[]> = {
    read: ["database", "performance"],
    upvote: ["rust", "systems"],
    bookmark: ["distributed-systems", "architecture"],
    comment: ["webassembly", "frontend"],
    share: ["microservices", "devops"],
  };
  return tags[action] ?? ["programming"];
}
