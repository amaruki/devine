# 13. Scoring and Game-Loop Strategy

This document is the source of truth for Devine's scoring, health, seniority, quests, and power-up loop. Cite this document instead of restating formulas in task cards.

## 13.1 Decision matrix

| Concern      | Decision                                     | Rationale                                                      |
| ------------ | -------------------------------------------- | -------------------------------------------------------------- |
| Daily target | 50 energy                                    | Matches MVP formula and makes reading alone enough for health. |
| Energy caps  | Per-action daily caps                        | Encourages meaningful variety and reduces farming.             |
| Health       | Fast-moving 0 to 100 internal state          | Makes neglect visible without redefining maturity.             |
| Seniority    | 7-day quality score from weighted components | Rewards learning quality rather than raw clicks.               |
| Power-ups    | Affect only energy and health                | Keeps seniority grounded in real behavior.                     |
| Missed days  | Process on dashboard open                    | Avoids background workers, which are out of scope.             |

## 13.2 Interface and request shape

```ts
export type ActivityType = "read" | "upvote" | "bookmark" | "comment" | "share";

export function calculateDailyEnergy(
  events: ActivityEvent[],
  effects: ActivePowerUpEffect[],
): EnergyResult;
export function calculateHealth(previousHealth: number, energyToday: number): HealthResult;
export function calculateSeniorityScore(events: ActivityEvent[]): SeniorityResult;
export function generateQuests(input: QuestInput): Quest[];
export function usePowerUp(input: UsePowerUpInput): UsePowerUpResult;
```

Demo action endpoint shape through server action input:

```ts
type DemoActionInput = {
  action: ActivityType;
  post?: {
    title?: string;
    tags?: string[];
    url?: string;
  };
};
```

## 13.3 Locked formula summary

| Action                       | Energy | Daily cap |
| ---------------------------- | -----: | --------: |
| Read article                 |     10 |         5 |
| Upvote                       |      3 |        10 |
| Bookmark                     |      5 |         5 |
| Comment or joined discussion |     15 |         3 |
| Share                        |     12 |         3 |

| Energy today  | Health change |
| ------------- | ------------: |
| 50 or more    |            +5 |
| 30 through 49 |             0 |
| 10 through 29 |            -8 |
| 1 through 9   |           -12 |
| 0             |           -20 |

Seniority score weights:

| Component           | Max points |
| ------------------- | ---------: |
| Reading Consistency |         30 |
| Topic Variety       |         15 |
| Curation            |         20 |
| Discussion          |         20 |
| Social Contribution |         10 |
| Deep Tech Signals   |          5 |

## 13.4 Performance targets

| Target                   |           Value | Source                                   |
| ------------------------ | --------------: | ---------------------------------------- |
| Demo mutation response   |      800 ms P95 | `08-non-functional-requirements.md §8.1` |
| Dashboard demo load      | 2.5 seconds P95 | `08-non-functional-requirements.md §8.4` |
| Activity volume per user |    1,000 events | `08-non-functional-requirements.md §8.1` |

## 13.5 Rate-limit and security constraints

1. Demo simulation buttons mutate only the authenticated user's state.
2. Daily caps apply before snapshot persistence.
3. Power-up multipliers apply to the next matching event only.
4. Revive Feather applies only when health is 0 through 9.
5. No power-up may directly change seniority score or stored activity history.

## 13.6 Component and contract

File layout:

```text
features/scoring/
├─ domain/
├─ application/
├─ tests/
└─ index.ts
features/quests/
├─ domain/
├─ application/
├─ tests/
└─ index.ts
features/powerups/
├─ domain/
├─ application/
├─ tests/
└─ index.ts
```

Locked public exports:

```ts
export {
  calculateDailyEnergy,
  calculateHealth,
  calculateSeniorityScore,
  normalizeTag,
} from "@/features/scoring";
export { generateQuests, calculateQuestProgress, claimQuestReward } from "@/features/quests";
export { addPowerUp, usePowerUp, consumeMatchingEffect } from "@/features/powerups";
```

## 13.7 What this does not do

1. It does not verify that a user truly read an external article. The MVP uses trust plus light friction.
2. It does not run a cron for missed days. Dashboard open owns missed-day processing.
3. It does not use AI to score maturity. Deterministic formulas own the score.
4. It does not persist quest definitions unless claimed-state requirements force it. Static config is enough for MVP.

## 13.8 Cross-references

| Related concern   | Source                                         |
| ----------------- | ---------------------------------------------- |
| Data tables       | `06-data-model.md`                             |
| Module surfaces   | `05-module-definitions.md §5.5` through `§5.7` |
| Testing scope     | `../../prd.md` Testing Decisions               |
| Demo requirements | `01-overview.md §1.5`                          |

## 13.9 Open follow-ups

1. Add daily aggregate rows only if event volume exceeds the NFR target.
2. Tune energy and seniority thresholds only after user testing shows clear imbalance.
3. Add stronger anti-cheat only if the product becomes competitive or public-facing beyond the hackathon MVP.
