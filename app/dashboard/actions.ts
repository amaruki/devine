"use server";

import { requireUser } from "../auth/require-user";

export async function applyDemoDashboardAction(
  action: "read" | "upvote" | "bookmark" | "comment" | "share",
) {
  await requireUser();
  return {
    status: "ok" as const,
    action,
  };
}
