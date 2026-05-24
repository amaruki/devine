import { z } from "zod";
import type { DemoPersonaKey } from "@/features/demo";
import { isValidPersona } from "@/features/demo";
import { isJudgeAccount, resetDemoStateForUser } from "@/lib/db/repositories/demo";
import { findUserByUsername } from "@/lib/db/repositories/demo";
import { insertAuditEvent } from "@/lib/db/repositories/demo";

export type ResetJudgeDemoAccountInput = {
  username: string;
  persona?: DemoPersonaKey;
};

export type ResetJudgeDemoAccountResult = {
  username: string;
  resetAt: string;
  persona: DemoPersonaKey;
};

export type ResetJudgeDemoAccountErrorCode = "forbidden" | "not_found" | "invalid_persona";

export type ResetJudgeDemoAccountResponse =
  | { status: "ok"; data: ResetJudgeDemoAccountResult }
  | { status: "error"; code: ResetJudgeDemoAccountErrorCode; message: string };

const resetJudgeDemoAccountSchema = z.object({
  username: z.string().min(1),
  persona: z.string().optional(),
});

export async function resetJudgeDemoAccount(
  input: ResetJudgeDemoAccountInput,
  actorId: string,
): Promise<ResetJudgeDemoAccountResponse> {
  const parsed = resetJudgeDemoAccountSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", code: "invalid_persona", message: "Invalid input." };
  }

  const persona = (parsed.data.persona ?? "code_monkey") as DemoPersonaKey;
  if (!isValidPersona(persona)) {
    return { status: "error", code: "invalid_persona", message: "Invalid persona." };
  }

  const targetUser = await findUserByUsername(parsed.data.username);
  if (!targetUser) {
    return { status: "error", code: "not_found", message: "Judge account not found." };
  }

  if (!(await isJudgeAccount(targetUser.id))) {
    return { status: "error", code: "not_found", message: "Not a judge demo account." };
  }

  const resetAt = new Date();
  await resetDemoStateForUser(targetUser.id, persona);

  await insertAuditEvent({
    actorUserId: actorId,
    targetUserId: targetUser.id,
    type: "judge_account_reset",
    metadata: { persona, username: targetUser.username, resetAt: resetAt.toISOString() },
  });

  return {
    status: "ok",
    data: {
      username: targetUser.username,
      resetAt: resetAt.toISOString(),
      persona,
    },
  };
}
