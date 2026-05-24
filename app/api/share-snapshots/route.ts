import { requireUser } from "@/app/auth/require-user";
import { createShareSnapshot, softDeleteShareSnapshot } from "@/features/share";
import { DAILY_TARGET } from "@/features/scoring";
import type { UserSnapshotState } from "@/features/share";
import { z } from "zod";

const createShareSnapshotRequestSchema = z.object({}).strict();
const deleteShareSnapshotRequestSchema = z.object({
  publicId: z.string().min(1),
});

export type CreateShareSnapshotResponse =
  | {
      publicId: string;
      url: string;
    }
  | {
      status: "error";
      message: string;
    };

export type DeleteShareSnapshotResponse =
  | {
      status: "deleted";
    }
  | {
      status: "not_found";
    }
  | {
      status: "error";
      message: string;
    };

export async function POST(request: Request) {
  const parsed = createShareSnapshotRequestSchema.safeParse(await request.json());

  if (!parsed.success) {
    return Response.json(
      { status: "error", message: "Invalid request body" } satisfies CreateShareSnapshotResponse,
      { status: 400 },
    );
  }

  const context = await requireUser();
  const state = await fetchUserSnapshotState(context.userId);
  const result = await createShareSnapshot(context.userId, state);

  return Response.json({
    publicId: result.publicId,
    url: result.url,
  } satisfies CreateShareSnapshotResponse);
}

export async function DELETE(request: Request) {
  const parsed = deleteShareSnapshotRequestSchema.safeParse(await request.json());

  if (!parsed.success) {
    return Response.json(
      { status: "error", message: "Invalid request body" } satisfies DeleteShareSnapshotResponse,
      { status: 400 },
    );
  }

  const context = await requireUser();
  const result = await softDeleteShareSnapshot(context.userId, parsed.data.publicId);

  if (result.status === "not_found") {
    return Response.json({ status: "not_found" } satisfies DeleteShareSnapshotResponse, {
      status: 404,
    });
  }

  return Response.json({ status: "deleted" } satisfies DeleteShareSnapshotResponse);
}

async function fetchUserSnapshotState(userId: string): Promise<UserSnapshotState> {
  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [{ activityEventRepository }, { findLatestSnapshotByUser }, { calculateDailyEnergy }] =
    await Promise.all([
      import("@/lib/db/repositories/activity"),
      import("@/lib/db/repositories/snapshot"),
      import("@/features/scoring"),
    ]);

  const [todayEvents, sevenDayEvents, latestSnapshot] = await Promise.all([
    activityEventRepository.findByUserAndDateRange(userId, todayStart, todayEnd),
    activityEventRepository.findByUserAndDateRange(userId, sevenDaysAgo, todayEnd),
    findLatestSnapshotByUser(userId),
  ]);

  const energy = calculateDailyEnergy(
    todayEvents.map((e) => ({ type: e.type, energyEarned: e.energyEarned })),
  );

  const topTags = getTopTags(
    sevenDayEvents.map((e) => ({ tags: (e.tags as string[]) ?? [], type: e.type })),
  );

  const seniorityLevel = (latestSnapshot?.seniorityLevel ??
    "code_monkey") as UserSnapshotState["seniorityLevel"];
  const seniorityScore = latestSnapshot?.seniorityScore ?? 0;
  const healthState = (latestSnapshot?.healthState ?? "stable") as UserSnapshotState["healthState"];

  return {
    seniorityLevel,
    seniorityScore,
    healthState,
    topTags,
    energyToday: energy.total,
    dailyTarget: DAILY_TARGET,
  };
}

function getTopTags(events: { tags: string[]; type: string }[]): string[] {
  const counts = new Map<string, number>();
  for (const event of events) {
    for (const tag of event.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([tag]) => tag);
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
