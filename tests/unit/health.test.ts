import { describe, expect, test } from "bun:test";
import { getHealth } from "@/lib/operations/health";

describe("getHealth", () => {
  test("returns the explicit health contract", async () => {
    await expect(getHealth()).resolves.toMatchObject({
      status: "ok",
      dependencies: {
        database: { status: "ok" },
        dailydev: { status: "degraded", checked: false },
      },
      version: "0.1.0",
    });
  });
});
