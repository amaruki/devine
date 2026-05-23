import { describe, expect, test } from "bun:test";
import { validateDailyDevToken } from "@/lib/dailydev";

describe("validateDailyDevToken", () => {
  test("rejects empty tokens", async () => {
    await expect(validateDailyDevToken(" ")).rejects.toThrow("daily.dev token is required");
  });
});
