import { describe, test, expect, mock } from "bun:test";
import { validateUsePowerUp, POWER_UP_MAX_HELD, POWER_UP_EFFECTS } from "../domain/effects";
import { usePowerUp, consumeMatchingEffect } from "../application/use-power-up";
import type { ActivePowerUpEffect } from "../domain/types";
import type { InventoryRow, UsePowerUpDeps } from "../application/ports";

// ── Mock factory ──

function createMockDeps(inventoryRows: InventoryRow[] = []): UsePowerUpDeps {
  return {
    inventory: {
      findByUser: mock().mockResolvedValue(inventoryRows),
      decrement: mock().mockResolvedValue({} as InventoryRow),
      increment: mock().mockResolvedValue({ row: {} as InventoryRow, capped: false }),
    },
    activeEffects: {
      findByUser: mock().mockResolvedValue([]),
      create: mock().mockResolvedValue({} as ActivePowerUpEffect),
    },
    createAuditEvent: mock().mockResolvedValue(undefined),
  };
}

// ── Domain: validateUsePowerUp ──

describe("validateUsePowerUp", () => {
  test("returns not_held when quantity is 0", () => {
    const result = validateUsePowerUp("snack", 0, { currentHealth: 62 });
    expect(result.status).toBe("not_held");
  });

  test("returns invalid_type for unknown type", () => {
    const result = validateUsePowerUp("invalid" as unknown as "snack", 1, { currentHealth: 62 });
    expect(result.status).toBe("invalid_type");
  });

  // AC-10.02: Snack adds +10 energy
  test("snack returns energy effect with value 10", () => {
    const result = validateUsePowerUp("snack", 1, { currentHealth: 62 });
    expect(result.status).toBe("ok");
    const effect = (result as { status: "ok"; effect: { effectType: string; value: number } })
      .effect;
    expect(effect.effectType).toBe("energy");
    expect(effect.value).toBe(10);
  });

  // AC-10.03: Medicine restores +15 health
  test("medicine returns health effect with value 15", () => {
    const result = validateUsePowerUp("medicine", 1, { currentHealth: 30 });
    expect(result.status).toBe("ok");
    const effect = (result as { status: "ok"; effect: { effectType: string; value: number } })
      .effect;
    expect(effect.effectType).toBe("health");
    expect(effect.value).toBe(15);
  });

  // AC-10.04: Knowledge Gem doubles next read reward
  test("knowledge_gem returns multiplier effect for read action", () => {
    const result = validateUsePowerUp("knowledge_gem", 1, { currentHealth: 62 });
    expect(result.status).toBe("ok");
    const effect = (
      result as {
        status: "ok";
        effect: { effectType: string; appliesToAction: string; multiplier: number };
      }
    ).effect;
    expect(effect.effectType).toBe("multiplier");
    expect(effect.appliesToAction).toBe("read");
    expect(effect.multiplier).toBe(2);
  });

  // AC-10.05: Social Boost doubles next comment/share reward
  test("social_boost returns multiplier effect for comment action", () => {
    const result = validateUsePowerUp("social_boost", 1, { currentHealth: 62 });
    expect(result.status).toBe("ok");
    const effect = (
      result as {
        status: "ok";
        effect: { effectType: string; appliesToAction: string; multiplier: number };
      }
    ).effect;
    expect(effect.effectType).toBe("multiplier");
    expect(effect.appliesToAction).toBe("comment");
    expect(effect.multiplier).toBe(2);
  });

  // AC-10.06: Revive Feather restores health to 35 when below 25
  test("revive_feather sets health to 35 when current health is below 25", () => {
    const result = validateUsePowerUp("revive_feather", 1, { currentHealth: 5 });
    expect(result.status).toBe("ok");
    const effect = (
      result as { status: "ok"; effect: { effectType: string; targetHealth: number } }
    ).effect;
    expect(effect.effectType).toBe("set_health");
    expect(effect.targetHealth).toBe(35);
  });

  test("revive_feather returns health_too_high when health is 25+", () => {
    const result = validateUsePowerUp("revive_feather", 1, { currentHealth: 25 });
    expect(result.status).toBe("health_too_high");
  });

  test("revive_feather returns health_too_high when health is above 25", () => {
    const result = validateUsePowerUp("revive_feather", 1, { currentHealth: 50 });
    expect(result.status).toBe("health_too_high");
  });

  test("revive_feather works at health 24 (borderline)", () => {
    const result = validateUsePowerUp("revive_feather", 1, { currentHealth: 24 });
    expect(result.status).toBe("ok");
  });
});

// ── Domain: config ──

describe("power-up max held quantities", () => {
  test("snack max held is 5", () => {
    expect(POWER_UP_MAX_HELD.snack).toBe(5);
  });

  test("medicine max held is 3", () => {
    expect(POWER_UP_MAX_HELD.medicine).toBe(3);
  });

  test("knowledge_gem max held is 2", () => {
    expect(POWER_UP_MAX_HELD.knowledge_gem).toBe(2);
  });

  test("social_boost max held is 2", () => {
    expect(POWER_UP_MAX_HELD.social_boost).toBe(2);
  });

  test("revive_feather max held is 1", () => {
    expect(POWER_UP_MAX_HELD.revive_feather).toBe(1);
  });
});

describe("power-up effects config", () => {
  test("snack adds +10 energy", () => {
    expect(POWER_UP_EFFECTS.snack.effect).toBe("energy");
    expect(POWER_UP_EFFECTS.snack.value).toBe(10);
  });

  test("medicine adds +15 health", () => {
    expect(POWER_UP_EFFECTS.medicine.effect).toBe("health");
    expect(POWER_UP_EFFECTS.medicine.value).toBe(15);
  });

  test("knowledge_gem is a 2x multiplier", () => {
    expect(POWER_UP_EFFECTS.knowledge_gem.effect).toBe("multiplier");
    expect(POWER_UP_EFFECTS.knowledge_gem.value).toBe(2);
  });

  test("social_boost is a 2x multiplier", () => {
    expect(POWER_UP_EFFECTS.social_boost.effect).toBe("multiplier");
    expect(POWER_UP_EFFECTS.social_boost.value).toBe(2);
  });
});

// ── Application: usePowerUp ──

describe("usePowerUp", () => {
  test("returns not_held when no inventory entry exists", async () => {
    const deps = createMockDeps();
    const result = await usePowerUp("user-1", { type: "snack" }, { currentHealth: 62 }, deps);
    expect(result.status).toBe("not_held");
  });

  test("returns not_held when quantity is 0", async () => {
    const deps = createMockDeps([{ id: "inv-1", userId: "user-1", type: "snack", quantity: 0 }]);
    const result = await usePowerUp("user-1", { type: "snack" }, { currentHealth: 62 }, deps);
    expect(result.status).toBe("not_held");
  });

  test("successfully uses snack and returns updated inventory", async () => {
    const initial: InventoryRow[] = [{ id: "inv-1", userId: "user-1", type: "snack", quantity: 1 }];
    const after: InventoryRow[] = [{ id: "inv-1", userId: "user-1", type: "snack", quantity: 0 }];

    const deps = createMockDeps();
    deps.inventory.findByUser = mock().mockResolvedValueOnce(initial).mockResolvedValueOnce(after);
    deps.inventory.decrement = mock().mockResolvedValue(after[0]);

    const result = await usePowerUp("user-1", { type: "snack" }, { currentHealth: 62 }, deps);
    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.effect.effectType).toBe("energy");
      expect(result.inventory).toEqual([{ type: "snack", quantity: 0 }]);
    }
  });

  // AC-10.07: Power-ups affect only energy and health, never seniority
  test("power-up effects never target seniority", async () => {
    const types = ["snack", "medicine", "knowledge_gem", "social_boost", "revive_feather"] as const;
    for (const type of types) {
      const ctx = type === "revive_feather" ? { currentHealth: 5 } : { currentHealth: 62 };

      const deps = createMockDeps([{ id: "inv-1", userId: "user-1", type, quantity: 1 }]);
      deps.inventory.findByUser = mock()
        .mockResolvedValueOnce([{ id: "inv-1", userId: "user-1", type, quantity: 1 }])
        .mockResolvedValueOnce([{ id: "inv-1", userId: "user-1", type, quantity: 0 }]);

      const result = await usePowerUp("user-1", { type }, ctx, deps);
      expect(result.status).toBe("ok");
      if (result.status === "ok") {
        expect(result.effect.effectType).not.toBe("seniority");
        expect(["energy", "health", "set_health", "multiplier"]).toContain(
          result.effect.effectType,
        );
      }
    }
  });

  test("revive_feather returns health_too_high when health is 25+", async () => {
    const deps = createMockDeps([
      { id: "inv-1", userId: "user-1", type: "revive_feather", quantity: 1 },
    ]);
    const result = await usePowerUp(
      "user-1",
      { type: "revive_feather" },
      { currentHealth: 50 },
      deps,
    );
    expect(result.status).toBe("health_too_high");
  });

  test("creates active effect when using knowledge_gem", async () => {
    const createSpy = mock().mockResolvedValue({
      id: "effect-1",
      userId: "user-1",
      type: "knowledge_gem",
      appliesToAction: "read",
      multiplier: 2,
      expiresAt: null,
      createdAt: new Date(),
    } satisfies ActivePowerUpEffect);

    const deps = createMockDeps([
      { id: "inv-1", userId: "user-1", type: "knowledge_gem", quantity: 1 },
    ]);
    deps.activeEffects.create = createSpy;
    deps.inventory.findByUser = mock()
      .mockResolvedValueOnce([
        { id: "inv-1", userId: "user-1", type: "knowledge_gem", quantity: 1 },
      ])
      .mockResolvedValueOnce([
        { id: "inv-1", userId: "user-1", type: "knowledge_gem", quantity: 0 },
      ]);

    const result = await usePowerUp(
      "user-1",
      { type: "knowledge_gem" },
      { currentHealth: 62 },
      deps,
    );
    expect(result.status).toBe("ok");
    expect(createSpy).toHaveBeenCalledTimes(1);
  });

  test("creates audit event on use", async () => {
    const auditSpy = mock().mockResolvedValue(undefined);
    const deps = createMockDeps([{ id: "inv-1", userId: "user-1", type: "medicine", quantity: 1 }]);
    deps.createAuditEvent = auditSpy;
    deps.inventory.findByUser = mock()
      .mockResolvedValueOnce([{ id: "inv-1", userId: "user-1", type: "medicine", quantity: 1 }])
      .mockResolvedValueOnce([{ id: "inv-1", userId: "user-1", type: "medicine", quantity: 0 }]);

    await usePowerUp("user-1", { type: "medicine" }, { currentHealth: 30 }, deps);
    expect(auditSpy).toHaveBeenCalledTimes(1);
    const callArg = auditSpy.mock.calls[0]?.[0] as {
      type: string;
      metadata: Record<string, unknown>;
    };
    expect(callArg.type).toBe("power_up_use");
    expect(callArg.metadata.powerUpType).toBe("medicine");
  });
});

// ── Application: consumeMatchingEffect ──

describe("consumeMatchingEffect", () => {
  function makeEffect(overrides: Partial<ActivePowerUpEffect> = {}): ActivePowerUpEffect {
    return {
      id: "effect-1",
      userId: "user-1",
      type: "knowledge_gem",
      appliesToAction: "read" as const,
      multiplier: 2,
      expiresAt: null,
      createdAt: new Date(),
      ...overrides,
    };
  }

  test("returns multiplier 1 when no effects match", () => {
    const effects: ActivePowerUpEffect[] = [makeEffect()];
    const { multiplier, consumed } = consumeMatchingEffect("comment", effects);
    expect(multiplier).toBe(1);
    expect(consumed).toEqual([]);
  });

  test("returns multiplier 2 for matching read effect", () => {
    const effects: ActivePowerUpEffect[] = [makeEffect()];
    const { multiplier, consumed } = consumeMatchingEffect("read", effects);
    expect(multiplier).toBe(2);
    expect(consumed).toEqual(effects);
  });

  test("stacks multipliers for multiple matching effects", () => {
    const effects: ActivePowerUpEffect[] = [makeEffect({ id: "a" }), makeEffect({ id: "b" })];
    const { multiplier, consumed } = consumeMatchingEffect("read", effects);
    expect(multiplier).toBe(4);
    expect(consumed.length).toBe(2);
  });

  test("consumes only matching effects, leaves others", () => {
    const match = makeEffect({ id: "match" });
    const noMatch = makeEffect({
      id: "no-match",
      appliesToAction: "comment" as const,
      type: "social_boost",
    });
    const effects = [match, noMatch];
    const { multiplier, consumed } = consumeMatchingEffect("read", effects);
    expect(multiplier).toBe(2);
    expect(consumed).toEqual([match]);
    expect(consumed.length).toBe(1);
  });
});
