import { describe, expect, test } from "bun:test";
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
