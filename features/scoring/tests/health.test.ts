import { describe, expect, test } from "bun:test";
import {
  applyHealthChange,
  computeHealthFromEvents,
  determineHealthChange,
  healthToState,
} from "@/features/scoring";

describe("determineHealthChange", () => {
  test("50 or more energy gives +5 health", () => {
    expect(determineHealthChange(50)).toBe(5);
    expect(determineHealthChange(100)).toBe(5);
  });

  test("30-49 energy gives 0 change", () => {
    expect(determineHealthChange(30)).toBe(0);
    expect(determineHealthChange(49)).toBe(0);
  });

  test("10-29 energy gives -8 health", () => {
    expect(determineHealthChange(10)).toBe(-8);
    expect(determineHealthChange(29)).toBe(-8);
  });

  test("1-9 energy gives -12 health", () => {
    expect(determineHealthChange(1)).toBe(-12);
    expect(determineHealthChange(9)).toBe(-12);
  });

  test("0 energy gives -20 health", () => {
    expect(determineHealthChange(0)).toBe(-20);
  });
});

describe("applyHealthChange", () => {
  test("applies positive delta", () => {
    const result = applyHealthChange(62, 5);
    expect(result.health).toBe(67);
    expect(result.healthState).toBe("stable");
  });

  test("applies negative delta", () => {
    const result = applyHealthChange(50, -8);
    expect(result.health).toBe(42);
    expect(result.healthState).toBe("tired");
  });

  test("clamps at 0", () => {
    const result = applyHealthChange(5, -20);
    expect(result.health).toBe(0);
    expect(result.healthState).toBe("hibernating");
  });

  test("clamps at 100", () => {
    const result = applyHealthChange(98, 5);
    expect(result.health).toBe(100);
    expect(result.healthState).toBe("thriving");
  });
});

describe("healthToState", () => {
  test("maps health values to states", () => {
    expect(healthToState(100)).toBe("thriving");
    expect(healthToState(80)).toBe("thriving");
    expect(healthToState(79)).toBe("stable");
    expect(healthToState(60)).toBe("stable");
    expect(healthToState(59)).toBe("tired");
    expect(healthToState(40)).toBe("tired");
    expect(healthToState(39)).toBe("sick");
    expect(healthToState(20)).toBe("sick");
    expect(healthToState(19)).toBe("critical");
    expect(healthToState(1)).toBe("critical");
    expect(healthToState(0)).toBe("hibernating");
  });
});

describe("computeHealthFromEvents", () => {
  test("combines energy and health computation", () => {
    const result = computeHealthFromEvents(62, 50);
    expect(result.health).toBe(67);
    expect(result.healthState).toBe("stable");
    expect(result.delta).toBe(5);
  });

  test("drops health on zero energy", () => {
    const result = computeHealthFromEvents(62, 0);
    expect(result.health).toBe(42);
    expect(result.healthState).toBe("tired");
    expect(result.delta).toBe(-20);
  });
});
