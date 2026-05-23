# Quest and Nudge API Contracts

**Version:** 0.1.0  
**Date:** 2026-05-23  
**Author:** Claude Code  
**Status:** Draft  
**Phase:** Sprint 3

## Scope

Covers quest reads, quest claiming, inventory reads, power-up usage, next best action, anti-doomscrolling nudges, and activity explainability.

Serves: AC-09.01, AC-09.02, AC-09.03, AC-09.04, AC-09.05, AC-10.01, AC-10.02, AC-10.03, AC-10.04, AC-10.05, AC-11.01, AC-11.02, AC-11.03, AC-11.04, AC-11.05

Sources: `../business/acceptance-criteria-breakdown/acceptance-criteria-sprint-3.md`, `../technical-specs/05-module-definitions.md`, `../technical-specs/06-data-model.md`, `../technical-specs/08-non-functional-requirements.md`, `../technical-specs/13-scoring-game-loop-strategy.md`

## Shared types

```ts
type QuestType = "daily" | "personalized" | "weekly";
type QuestStatus = "active" | "completed" | "claimed";
type PowerUpType = "snack" | "knowledge_gem" | "social_boost" | "revive_feather";

type QuestView = {
  id: string;
  key: string;
  type: QuestType;
  title: string;
  description: string;
  status: QuestStatus;
  progress: number;
  target: number;
  rewardPowerUp: PowerUpType;
  dateScope: string;
};

type InventoryItemView = {
  type: PowerUpType;
  quantity: number;
};
```

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
4. `snack` affects energy or health according to game-loop implementation.
5. `knowledge_gem` creates the next matching read multiplier.
6. `social_boost` creates the next matching comment or share multiplier.
7. `revive_feather` applies only when health is 0 through 9 and sets health to the documented recovery state.
8. No power-up may directly change seniority score or stored activity history.
9. Creates `power_up_use` audit event.

Errors:

| Condition                                      | Error code                |
| ---------------------------------------------- | ------------------------- |
| Missing session                                | `unauthorized`            |
| Unknown power-up                               | `invalid_power_up`        |
| Quantity is zero                               | `power_up_unavailable`    |
| Revive Feather used outside valid health range | `power_up_not_applicable` |

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
