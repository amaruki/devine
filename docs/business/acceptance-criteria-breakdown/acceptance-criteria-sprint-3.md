# Acceptance Criteria — Sprint 3

## User Stories in Scope

- **US-09** Daily, personalized, and weekly quests — Developer
- **US-10** Earn, store, and use power-ups — Developer
- **US-11** A next best action and anti-doomscrolling nudge — Developer

---

## US-09 — Daily, personalized, and weekly quests (Developer)

### AC-09.01 — Daily quests

```gherkin
Given the Developer is using Devine
When daily quests
Then Dashboard includes Feed the Duck, Future-You Bookmark, and Touch Grass, But Online
```

### AC-09.02 — Personalized quest

```gherkin
Given the Developer is using Devine
When personalized quest
Then Dashboard includes one personalized quest based on historical trend and the weakest area derived from the 7-day seniority score
```

### AC-09.03 — Weekly quest

```gherkin
Given the Developer is using Devine
When weekly quest
Then Dashboard includes Five-Day Learning Streak progress
```

### AC-09.04 — Quest completion

```gherkin
Given the Developer is using Devine
When quest completion
Then A quest is complete when its condition is met and its configured reward is granted to inventory
```

### AC-09.05 — Quest progress

```gherkin
Given the Developer is using Devine
When quest progress
Then Quest progress updates from normalized activity events
```

### AC-09.06 — Quest configuration

```gherkin
Given the Developer is using Devine
When quest configuration
Then Each quest defines progress events, reward type, reward quantity, and reset cadence
```

---

## US-10 — Earn, store, and use power-ups (Developer)

### AC-10.01 — Inventory

```gherkin
Given the Developer is using Devine
When inventory
Then Earned power-ups appear in inventory, require manual use, and each use is final and auditable
```

### AC-10.02 — Snack

```gherkin
Given the Developer is using Devine
When snack
Then Snack adds +10 energy and has max held quantity 5
```

### AC-10.03 — Medicine

```gherkin
Given the Developer is using Devine
When medicine
Then Medicine restores +15 health and has max held quantity 3
```

### AC-10.04 — Knowledge Gem

```gherkin
Given the Developer is using Devine
When knowledge Gem
Then Knowledge Gem doubles only the next read reward and has max held quantity 2
```

### AC-10.05 — Social Boost

```gherkin
Given the Developer is using Devine
When social Boost
Then Social Boost doubles only the next comment or share reward and has max held quantity 2
```

### AC-10.06 — Revive Feather

```gherkin
Given the Developer is using Devine
When revive Feather
Then Revive Feather can be used when health is below 25, restores health to 35, and has max held quantity 1
```

### AC-10.07 — Seniority integrity

```gherkin
Given the Developer is using Devine
When seniority integrity
Then Power-ups affect only energy and health, never seniority directly
```

---

## US-11 — A next best action and anti-doomscrolling nudge (Developer)

### AC-11.01 — Next best action

```gherkin
Given the Developer is using Devine
When next best action
Then Dashboard recommends the most useful next action type
```

### AC-11.02 — Topic hint

```gherkin
Given the Developer is using Devine
When topic hint
Then Recommendation includes tags/topics when data supports it
```

### AC-11.03 — MVP fallback

```gherkin
Given the Developer is using Devine
When mVP fallback
Then Recommendation remains useful when only action type can be determined
```

### AC-11.04 — Anti-doomscrolling

```gherkin
Given the Developer is using Devine
When anti-doomscrolling
Then User sees positive nudges to curate or discuss instead of endlessly reading
```

### AC-11.05 — Read cap nudge

```gherkin
Given the Developer is using Devine
When read cap nudge
Then After read rewards are capped for the day, next best action prioritizes curation, discussion, or sharing over more reading
```

---
