"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "../auth/require-user";
import { isValidPersona } from "@/features/demo";
import type { DemoPersonaKey } from "@/features/demo";

export async function disconnectDailyDevConnection() {
  await requireUser();
  return { status: "ok" as const };
}

export async function resetDemoStateAction(persona: DemoPersonaKey = "code_monkey") {
  const user = await requireUser();

  if (!isValidPersona(persona)) {
    return { status: "error" as const, error: "Invalid persona." };
  }

  // Update the user's persona preference
  const { updateUserPersona } = await import("@/lib/db/repositories/demo");
  await updateUserPersona(user.userId, persona);

  revalidatePath("/dashboard");
  revalidatePath("/settings");

  return { status: "ok" as const };
}
