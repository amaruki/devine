"use server";

export async function applyDemoDashboardAction(
  action: "read" | "upvote" | "bookmark" | "comment" | "share",
) {
  return {
    status: "ok" as const,
    action,
  };
}
