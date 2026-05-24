"use server";

import { requireUser } from "../auth/require-user";

export async function disconnectDailyDevConnection() {
  await requireUser();
  return { status: "ok" as const };
}
