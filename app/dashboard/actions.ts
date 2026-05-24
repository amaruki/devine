"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "../auth/require-user";
import { recordActivityWithDependencies } from "@/features/activity";
import { calculateDailyEnergy, computeDailySnapshot, DAILY_TARGET } from "@/features/scoring";
import { claimQuestReward, type ClaimQuestRewardResult } from "@/features/quests";
import type { ActivityInput } from "@/features/activity";
import type { UsePowerUpResult, PowerUpType } from "@/features/powerups";
import { usePowerUp } from "@/features/powerups";

export async function applyDemoDashboardAction(
  action: "read" | "upvote" | "bookmark" | "comment" | "share",
) {
  const user = await requireUser();

  const [{ activityEventRepository }, { findLatestSnapshotByUser, upsertDailySnapshot }] =
    await Promise.all([
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

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [todayEvents, sevenDayEvents, latestSnapshot] = await Promise.all([
    activityEventRepository.findByUserAndDateRange(user.userId, todayStart, todayEnd),
    activityEventRepository.findByUserAndDateRange(user.userId, sevenDaysAgo, todayEnd),
    findLatestSnapshotByUser(user.userId),
  ]);

  const previousHealth = latestSnapshot?.health ?? 62;
  const lastSnapshotDate = latestSnapshot?.date ? new Date(latestSnapshot.date) : null;

  const snapshotResult = computeDailySnapshot({
    todayEvents: todayEvents.map((e) => ({
      type: e.type,
      energyEarned: e.energyEarned,
      tags: (e.tags as string[]) ?? [],
      occurredAt: new Date(e.occurredAt),
    })),
    sevenDayEvents: sevenDayEvents.map((e) => ({
      type: e.type,
      tags: (e.tags as string[]) ?? [],
      occurredAt: new Date(e.occurredAt),
    })),
    previousHealth,
    lastSnapshotDate,
    today,
  });

  // Persist today's snapshot
  await upsertDailySnapshot({
    userId: user.userId,
    date: todayStr,
    energyEarned: snapshotResult.energyEarned,
    health: snapshotResult.health,
    healthState: snapshotResult.healthState,
    seniorityScore: snapshotResult.seniorityScore,
    seniorityLevel: snapshotResult.seniorityLevel,
    scoreBreakdown: snapshotResult.scoreBreakdown,
    completedQuests: latestSnapshot?.completedQuests ?? [],
    powerUpsEarned: latestSnapshot?.powerUpsEarned ?? [],
  });

  const energy = calculateDailyEnergy(
    todayEvents.map((e) => ({ type: e.type, energyEarned: e.energyEarned })),
  );

  revalidatePath("/dashboard");

  return {
    status: result.status,
    action,
    energyEarned: result.status === "ok" ? result.event.energyEarned : 0,
    energyToday: energy.total,
    dailyTarget: DAILY_TARGET,
    healthState: snapshotResult.healthState,
    seniorityLevel: snapshotResult.seniorityLevel,
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

export async function claimQuestRewardAction(questId: string): Promise<ClaimQuestRewardResult> {
  const user = await requireUser();

  const [{ questRepository }, { inventoryRepository, createAuditEvent }] = await Promise.all([
    import("@/lib/db/repositories/quest"),
    import("@/lib/db/repositories/inventory"),
  ]);

  const { activityEventRepository } = await import("@/lib/db/repositories/activity");

  const deps = {
    quests: questRepository,
    events: activityEventRepository,
    inventory: inventoryRepository,
    createAuditEvent,
  };

  return claimQuestReward(user.userId, { questId }, deps);
}

export async function usePowerUpAction(type: string): Promise<UsePowerUpResult> {
  const user = await requireUser();

  const { inventoryRepository, activeEffectRepository, createAuditEvent } = await import(
    "@/lib/db/repositories/inventory"
  );

  const { findLatestSnapshotByUser } = await import("@/lib/db/repositories/snapshot");

  const latestSnapshot = await findLatestSnapshotByUser(user.userId);
  const currentHealth = latestSnapshot?.health ?? 62;

  const validTypes = ["snack", "medicine", "knowledge_gem", "social_boost", "revive_feather"];
  if (!validTypes.includes(type)) {
    return { status: "invalid_type" };
  }

  const deps = {
    inventory: inventoryRepository,
    activeEffects: activeEffectRepository,
    createAuditEvent,
  };

  const result = await usePowerUp(
    user.userId,
    { type: type as PowerUpType },
    { currentHealth },
    deps,
  );

  revalidatePath("/dashboard");
  return result;
}
