import { describe, expect, mock, test } from "bun:test";
import { isValidPersona } from "@/features/demo";
import type { DemoPersonaKey } from "@/features/demo";

describe("judge account validation", () => {
  test("recognizes all four valid persona keys", () => {
    const valid: DemoPersonaKey[] = ["copaster", "code_monkey", "scholar", "philosopher"];

    for (const persona of valid) {
      expect(isValidPersona(persona)).toBeTrue();
    }
  });

  test("rejects unknown persona strings", () => {
    expect(isValidPersona("admin")).toBeFalse();
    expect(isValidPersona("judge")).toBeFalse();
    expect(isValidPersona("")).toBeFalse();
    expect(isValidPersona("COPaster")).toBeFalse();
  });

  test("all persona keys match the DEMO_PERSONAS record", () => {
    const { DEMO_PERSONAS } = require("@/features/demo");

    for (const key of Object.keys(DEMO_PERSONAS)) {
      expect(isValidPersona(key)).toBeTrue();
    }
    expect(Object.keys(DEMO_PERSONAS)).toHaveLength(4);
  });
});

describe("resetJudgeDemoAccount", () => {
  const actorId = "actor-uuid-001";
  const judgeUserId = "judge-uuid-001";
  const judgeUsername = "code_monkey";

  function createMockRepo(
    overrides: {
      user?: { id: string; username: string } | null;
      isJudge?: boolean;
    } = {},
  ) {
    const findUserByUsername = mock(async (_username: string) => {
      return overrides.user === undefined
        ? { id: judgeUserId, username: judgeUsername }
        : overrides.user;
    });

    const isJudgeAccount = mock(async (_userId: string) => {
      return overrides.isJudge ?? true;
    });

    const resetDemoStateForUser = mock(async (_userId: string, _persona: string) => {});

    const insertAuditEvent = mock(
      async (_input: {
        actorUserId: string | null;
        targetUserId: string | null;
        type: string;
        metadata: Record<string, string>;
      }) => {},
    );

    return { findUserByUsername, isJudgeAccount, resetDemoStateForUser, insertAuditEvent };
  }

  test("resets a valid judge account with default persona", async () => {
    const repo = createMockRepo();

    mock.module("@/lib/db/repositories/demo", () => ({
      findUserByUsername: repo.findUserByUsername,
      isJudgeAccount: repo.isJudgeAccount,
      resetDemoStateForUser: repo.resetDemoStateForUser,
      insertAuditEvent: repo.insertAuditEvent,
    }));

    const { resetJudgeDemoAccount } = await import("@/features/demo/application/judge-reset");
    const result = await resetJudgeDemoAccount({ username: "code_monkey" }, actorId);

    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.data.username).toBe("code_monkey");
      expect(result.data.persona).toBe("code_monkey");
      expect(result.data.resetAt).toBeTruthy();
    }
    expect(repo.findUserByUsername).toHaveBeenCalledTimes(1);
    expect(repo.isJudgeAccount).toHaveBeenCalledTimes(1);
    expect(repo.resetDemoStateForUser).toHaveBeenCalledWith(judgeUserId, "code_monkey");
    expect(repo.insertAuditEvent).toHaveBeenCalledTimes(1);
  });

  test("resets a judge account with explicit persona", async () => {
    const repo = createMockRepo();

    mock.module("@/lib/db/repositories/demo", () => ({
      findUserByUsername: repo.findUserByUsername,
      isJudgeAccount: repo.isJudgeAccount,
      resetDemoStateForUser: repo.resetDemoStateForUser,
      insertAuditEvent: repo.insertAuditEvent,
    }));

    const { resetJudgeDemoAccount } = await import("@/features/demo/application/judge-reset");
    const result = await resetJudgeDemoAccount(
      { username: "scholar", persona: "scholar" },
      actorId,
    );

    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.data.persona).toBe("scholar");
    }
    expect(repo.resetDemoStateForUser).toHaveBeenCalledWith(judgeUserId, "scholar");
  });

  test("returns not_found for unknown username", async () => {
    const repo = createMockRepo({ user: null });

    mock.module("@/lib/db/repositories/demo", () => ({
      findUserByUsername: repo.findUserByUsername,
      isJudgeAccount: repo.isJudgeAccount,
      resetDemoStateForUser: repo.resetDemoStateForUser,
      insertAuditEvent: repo.insertAuditEvent,
    }));

    const { resetJudgeDemoAccount } = await import("@/features/demo/application/judge-reset");
    const result = await resetJudgeDemoAccount({ username: "nobody" }, actorId);

    expect(result).toEqual({
      status: "error",
      code: "not_found",
      message: "Judge account not found.",
    });
    expect(repo.isJudgeAccount).toHaveBeenCalledTimes(0);
    expect(repo.resetDemoStateForUser).toHaveBeenCalledTimes(0);
  });

  test("returns not_found when user exists but is not a judge account", async () => {
    const repo = createMockRepo({ isJudge: false });

    mock.module("@/lib/db/repositories/demo", () => ({
      findUserByUsername: repo.findUserByUsername,
      isJudgeAccount: repo.isJudgeAccount,
      resetDemoStateForUser: repo.resetDemoStateForUser,
      insertAuditEvent: repo.insertAuditEvent,
    }));

    const { resetJudgeDemoAccount } = await import("@/features/demo/application/judge-reset");
    const result = await resetJudgeDemoAccount({ username: "regular_user" }, actorId);

    expect(result).toEqual({
      status: "error",
      code: "not_found",
      message: "Not a judge demo account.",
    });
    expect(repo.isJudgeAccount).toHaveBeenCalledTimes(1);
    expect(repo.resetDemoStateForUser).toHaveBeenCalledTimes(0);
  });

  test("returns invalid_persona for unknown persona", async () => {
    const repo = createMockRepo();

    mock.module("@/lib/db/repositories/demo", () => ({
      findUserByUsername: repo.findUserByUsername,
      isJudgeAccount: repo.isJudgeAccount,
      resetDemoStateForUser: repo.resetDemoStateForUser,
      insertAuditEvent: repo.insertAuditEvent,
    }));

    const { resetJudgeDemoAccount } = await import("@/features/demo/application/judge-reset");
    const result = await resetJudgeDemoAccount(
      { username: "code_monkey", persona: "invalid" as DemoPersonaKey },
      actorId,
    );

    expect(result).toEqual({
      status: "error",
      code: "invalid_persona",
      message: "Invalid persona.",
    });
    expect(repo.findUserByUsername).toHaveBeenCalledTimes(0);
    expect(repo.resetDemoStateForUser).toHaveBeenCalledTimes(0);
  });

  test("records audit event with correct metadata on success", async () => {
    const repo = createMockRepo();

    mock.module("@/lib/db/repositories/demo", () => ({
      findUserByUsername: repo.findUserByUsername,
      isJudgeAccount: repo.isJudgeAccount,
      resetDemoStateForUser: repo.resetDemoStateForUser,
      insertAuditEvent: repo.insertAuditEvent,
    }));

    const { resetJudgeDemoAccount } = await import("@/features/demo/application/judge-reset");
    await resetJudgeDemoAccount({ username: "code_monkey", persona: "philosopher" }, actorId);

    expect(repo.insertAuditEvent).toHaveBeenCalledTimes(1);
    const auditCall = repo.insertAuditEvent.mock.calls[0]?.[0] as {
      actorUserId: string;
      targetUserId: string;
      type: string;
      metadata: Record<string, string>;
    };
    expect(auditCall.actorUserId).toBe(actorId);
    expect(auditCall.targetUserId).toBe(judgeUserId);
    expect(auditCall.type).toBe("judge_account_reset");
    expect(auditCall.metadata.persona).toBe("philosopher");
    expect(auditCall.metadata.username).toBe("code_monkey");
    expect(auditCall.metadata.resetAt).toBeTruthy();
  });
});
