# Quest and Nudge API Contracts

**Version:** 1.0.0  
**Date:** 2026-05-24  
**Author:** Claude Code  
**Status:** Approved  
**Phase:** Sprint 3

## Scope

Covers quest reads, quest claiming, inventory reads, power-up usage, next best action, anti-doomscrolling nudges, and activity explainability.

Serves: AC-09.01, AC-09.02, AC-09.03, AC-09.04, AC-09.05, AC-09.06, AC-10.01, AC-10.02, AC-10.03, AC-10.04, AC-10.05, AC-10.06, AC-10.07, AC-11.01, AC-11.02, AC-11.03, AC-11.04, AC-11.05

Sources: `../business/acceptance-criteria-breakdown/acceptance-criteria-sprint-3.md`, `../technical-specs/05-module-definitions.md`, `../technical-specs/06-data-model.md`, `../technical-specs/08-non-functional-requirements.md`, `../technical-specs/13-scoring-game-loop-strategy.md`

## Shared types

```ts
type QuestType = "daily" | "personalized" | "weekly";
type QuestStatus = "active" | "completed" | "claimed";
type PowerUpType = "snack" | "medicine" | "knowledge_gem" | "social_boost" | "revive_feather";

type QuestView = {
  id: string;
  key: string;
  type: QuestType;
  title: string;
  description: string;
  status: QuestStatus;
  progress: number;
  target: number;
  rewardType: PowerUpType;
  rewardQuantity: number;
  dateScope: string;
};

type InventoryItemView = {
  type: PowerUpType;
  quantity: number;
  maxHeld: number;
};
```

## Quest configuration (AC-09.06)

Quest definitions are static code configuration. The persistence layer stores only progress, status, `date_scope`, and `reward_power_up` for `claimed`-state tracking. Each quest defines the properties in `QuestConfig`.

```ts
type QuestConfig = {
  key: string;
  type: QuestType;
  title: string;
  description: string;
  progressEvents: ActivityType[];
  rewardType: PowerUpType;
  rewardQuantity: number;
  target: number;
  resetCadence: "daily" | "weekly" | "never";
};
```

| Quest key                | Type           | Target | Reward        | Reset  |
| ------------------------ | -------------- | -----: | ------------- | ------ |
| `feed_the_duck`          | `daily`        |      3 | `snack` ×1    | daily  |
| `future_you_bookmark`    | `daily`        |      1 | `snack` ×1    | daily  |
| `touch_grass_but_online` | `daily`        |      1 | `snack` ×1    | daily  |
| `weakest_area`           | `personalized` | varies | varies        | daily  |
| `five_day_streak`        | `weekly`       |      5 | `medicine` ×1 | weekly |

The `weakest_area` quest derives target, reward, and progress events from the user's lowest 7-day seniority score component. It may grant a `knowledge_gem` or `social_boost` instead of a `snack`.

## Quest read

### `getQuestState()`

Server-only dashboard loader.

```ts
type QuestState = {
  quests: QuestView[];
  inventory: InventoryItemView[];
  nextBestAction: NextBestAction;
  nudge: DoomscrollNudge | null;
};
```

Rules:

1. Requires authenticated user.
2. Returns daily, personalized, and weekly quests.
3. Uses recent activity and current seniority breakdown for personalization.
4. Does not require daily.dev connected mode.
5. Static quest definitions are allowed for MVP, with persisted claimed state when needed.

Errors:

| Condition            | Error code            |
| -------------------- | --------------------- |
| Missing session      | `unauthorized`        |
| Database unavailable | `service_unavailable` |

## Claim quest reward

### `claimQuestReward(input)`

Server action for completed quests.

```ts
type ClaimQuestRewardInput = {
  questId: string;
};

type ClaimQuestRewardResult = {
  quest: QuestView;
  inventory: InventoryItemView[];
};
```

Rules:

1. Requires authenticated user.
2. Quest must belong to the caller.
3. Quest must be `completed` and not already `claimed`.
4. Adds exactly one reward power-up to inventory.
5. Creates `quest_reward_grant` audit event.
6. Repeated claim attempts return `already_claimed` and do not duplicate inventory.

Errors:

| Condition                | Error code            |
| ------------------------ | --------------------- |
| Quest not found for user | `not_found`           |
| Quest not completed      | `quest_not_completed` |
| Already claimed          | `already_claimed`     |
| Database unavailable     | `service_unavailable` |

## Inventory read

### `getInventory()`

```ts
type InventoryResult = {
  items: InventoryItemView[];
  activeEffects: ActivePowerUpEffectView[];
};

type ActivePowerUpEffectView = {
  type: "knowledge_gem" | "social_boost";
  appliesToAction: "read" | "comment" | "share";
  multiplier: number;
  expiresAt: string | null;
};
```

Rules:

1. Requires authenticated user.
2. Returns only the caller's inventory.
3. Omits zero-quantity items unless the UI explicitly requests a catalog in a future spec.

## Use power-up

### `usePowerUp(input)`

Server action.

```ts
type UsePowerUpInput = {
  type: PowerUpType;
};

type UsePowerUpResult = {
  inventory: InventoryItemView[];
  activeEffects: ActivePowerUpEffectView[];
  dashboardPatch: {
    health?: number;
    healthState?: HealthState;
  };
};
```

Rules:

1. Requires authenticated user.
2. User must own at least one item of the selected type.
3. Decrements inventory once on success.
4. `snack` adds +10 energy (max held: 5).
5. `medicine` restores +15 health (max held: 3).
6. `knowledge_gem` creates the next matching read multiplier (max held: 2).
7. `social_boost` creates the next matching comment or share multiplier (max held: 2).
8. `revive_feather` applies only when health is below 25 and sets health to 35 (max held: 1).
9. No power-up may directly change seniority score or stored activity history.
10. Creates `power_up_use` audit event.

Errors:

| Condition                                      | Error code                |
| ---------------------------------------------- | ------------------------- |
| Missing session                                | `unauthorized`            |
| Unknown power-up                               | `invalid_power_up`        |
| Quantity is zero                               | `power_up_unavailable`    |
| Revive Feather used outside valid health range | `power_up_not_applicable` |
| Power-up at max held capacity                  | `power_up_at_capacity`    |

## Next best action

### `getNextBestAction()`

Server-only loader that can be embedded in `getQuestState()`.

```ts
type NextBestAction = {
  action: "read" | "bookmark" | "comment" | "share" | "take_break";
  title: string;
  reason: string;
  relatedQuestId?: string;
  suggestedTag?: string;
};
```

Rules:

1. Requires authenticated user.
2. Uses today's energy, daily caps, active quests, weak score components, and recent activity.
3. Must prefer an action that can still earn value today.
4. Returns `take_break` when caps or anti-doomscrolling rules make more activity unhelpful.

## Anti-doomscrolling nudge

```ts
type DoomscrollNudge = {
  severity: "info" | "warning";
  message: string;
  suggestedAction: "reflect" | "discuss" | "share" | "take_break";
};
```

Rules:

1. Trigger from repetitive low-value activity patterns or exhausted caps.
2. Do not block the user from continuing.
3. Use deterministic safe copy.
4. Do not shame the user.

## Activity explainability

### `getActivityExplanation(input)`

```ts
type ActivityExplanationInput = {
  eventId: string;
};

type ActivityExplanation = {
  event: ActivityEventView;
  counted: boolean;
  energyRule: string;
  capApplied: boolean;
  powerUpApplied: PowerUpType | null;
  scoreComponentsAffected: string[];
};
```

Rules:

1. Requires authenticated user.
2. Event must belong to the caller.
3. Explanation is derived from stored event and scoring rules.
4. Missing API fields do not break the explanation.

Errors:

| Condition                | Error code     |
| ------------------------ | -------------- |
| Event not found for user | `not_found`    |
| Missing session          | `unauthorized` |

## Reward and seniority integrity boundaries (AC-10.07)

These boundaries are enforced at the server-action and domain-engine level.

**Reward integrity:**

1. Quest reward grants are idempotent. A claimed quest never grants its reward twice.
2. `claimQuestReward` transitions `completed` → `claimed` atomically within a transaction, then inserts the inventory row. No other code path may grant quest rewards.
3. The `quest_reward_grant` audit event is created in the same transaction as the inventory mutation.
4. Reward power-up inventory insertion respects the `maxHeld` cap for the target type. If the user is already at the cap, the reward is discarded and the claim still succeeds — the quest transitions to `claimed` with no inventory change.

**Seniority integrity:**

5. Power-ups affect only energy and health, never seniority score or stored activity history.
6. The `usePowerUp` result includes `dashboardPatch` with health/healthState changes only. It never returns score mutations.
7. Power-up effects (`knowledge_gem`, `social_boost`) apply only to the energy earned on the next matching activity event. They do not alter the seniority component weights, raw event data, or tag metadata.
8. The `ActivePowerUpEffectView` type exposes `appliesToAction` and `multiplier` but no seniority-related fields.

**Quest integrity:**

9. Personalized quest derivation reads from the 7-day seniority score breakdown but never mutates it.
10. Quest progress is derived from normalized `activity_events` rows. No quest completion path writes to `activity_events`, `daily_pet_snapshots`, or scoring tables.
11. Quest reset cadence (`daily`, `weekly`) is enforced by `date_scope` comparison. A quest whose `date_scope` no longer matches the current date or ISO week resets to `active` with `progress=0` on next read.

**Downstream contract checklist:**

| Backend card | Contracts consumed                                                          |
| ------------ | --------------------------------------------------------------------------- |
| BE-S3-01     | QuestConfig, QuestView, QuestState, claimQuestReward input/output           |
| BE-S3-02     | InventoryItemView, InventoryResult, usePowerUp input/output, power-up rules |
| BE-S3-03     | NextBestAction, DoomscrollNudge, ActivityExplanation input/output           |
| FE-S3-01     | QuestView, QuestState                                                       |
| FE-S3-02     | InventoryItemView, ActivePowerUpEffectView, usePowerUp result               |
| FE-S3-03     | NextBestAction, DoomscrollNudge                                             |
| FE-S3-04     | All contract types, integrity boundaries                                    |
