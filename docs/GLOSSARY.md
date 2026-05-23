# Devine Glossary

Devine vocabulary for product, code, specs, and sprint work.

## Table of Contents

- [Product and brand](#product-and-brand)
- [Pet state and scoring](#pet-state-and-scoring)
- [Activity and game loop](#activity-and-game-loop)
- [daily.dev integration](#dailydev-integration)
- [Share and privacy](#share-and-privacy)
- [Workflow](#workflow)

## Product and brand

### Devine

The project name for the daily.dev-powered rubber duck companion app. Devine turns developer reading and engagement signals into pet state, quests, and shareable progress.

### Tagline

The product tagline is “Define your stack, develop your mind.” It frames the app as a developer learning habit product rather than a generic pet game.

### Rubber duck

The central virtual pet and companion. It represents the user's learning habit through visual state, speech bubbles, seniority level, health, energy, quests, and power-ups.

### Demo mode

A first-class app mode that lets judges and contributors try Devine without connecting a real daily.dev Personal Access Token. Demo mode is required to keep the live demo reliable when credentials or daily.dev API access are unavailable.

### Connected mode

The app mode where a user connects a daily.dev Personal Access Token and Devine uses available personalized daily.dev data. Connected mode must degrade gracefully when daily.dev requests fail.

### Judge demo

The 60-second hackathon demonstration path that shows the landing page, dashboard, simulated activity, game-state changes, and a public share snapshot.

## Pet state and scoring

### Energy

The fast-moving daily habit metric earned from reading and engagement actions. The documented daily target is 50 energy.

### Health

The pet's survivability and visual condition state. Health is clamped between 0 and 100 and changes faster than seniority.

### Health state

The named visual condition derived from health. The documented states are Thriving, Stable, Tired, Sick, Critical, and Hibernating.

### Hibernating

The lowest recoverable health state. It replaces permanent death so a user can return after missing learning targets.

### Seniority

The displayed maturity narrative based on a rolling 7-day learning-quality score. Seniority changes more slowly than health.

### Seniority score

A 0 to 100 score based on recent reading consistency, topic variety, curation, discussion, social contribution, and deep technology signals.

### Si Dungu / The Ignorant Copaster

The lowest seniority level for low or shallow learning behavior. It appears in docs and product language as a satirical developer maturity state.

### Si Pekerja Mekanis / The Code Monkey

The seniority level for passive reading or recoverable midpoint behavior. The default judge demo persona starts here.

### Sang Intelektual / The Grounded Scholar

The seniority level for active curation and grounded learning behavior.

### Sang Filsuf / The Tech Philosopher

The highest seniority level for reflective, high-quality engagement.

### Deep technology signals

Interactions with topics such as architecture, system design, distributed systems, security, AI, machine learning, DevOps, cloud, database, performance, and observability.

### Tag normalization

The process of standardizing tags before scoring. Examples include lowercasing, converting spaces to hyphens, and mapping aliases such as `ml` to `machine-learning`.

## Activity and game loop

### Activity event

A normalized record of a learning or engagement action. Events may come from daily.dev data, in-app Devine tracking, or demo simulation.

### Daily cap

The maximum amount of daily credit a repeated action type can earn. Caps prevent farming and encourage varied learning behavior.

### Daily target

The daily energy threshold needed to keep the duck stable or improve health. The documented target is 50 energy.

### Missed-day processing

The health decay applied when a user opens the dashboard after missing learning targets. The MVP calculates this on dashboard open instead of using background jobs.

### Quest

A short-term task that nudges the user toward better learning behavior. The documented quest types include daily quests, one personalized quest, and a weekly five-day learning streak quest.

### Personalized quest

A quest selected from the user's weakest seniority component. It nudges the user toward balanced learning habits.

### Power-up

An inventory item earned through quests and used manually. Power-ups affect energy or health but must not directly change seniority score.

### Snack

A power-up that adds energy.

### Medicine

A power-up that restores health.

### Knowledge Gem

A power-up that doubles the next read reward.

### Social Boost

A power-up that doubles the next comment or share reward.

### Revive Feather

A power-up that helps recover from Critical or Hibernating health ranges.

### Next best action

A dashboard recommendation for the most useful action type or topic to improve the user's current learning habit.

### Anti-doomscrolling nudge

Positive guidance that encourages curation, discussion, or stopping after useful reading instead of endless passive browsing.

### Speech bubble

Playful duck copy generated from templates and lightweight context such as seniority, health state, top tags, recent bookmarks, and weakest score area.

## daily.dev integration

### daily.dev

The developer content platform that supplies the content and personalization context for Devine.

### Personal Access Token

A user-provided daily.dev Bearer token used for personalized API access. Tokens must be stored encrypted server-side and never exposed to the browser.

### Token validation

The process of testing whether a submitted daily.dev token works before marking a connection active.

### Token revocation

The user's ability to disconnect daily.dev and delete stored token data from Devine.

### Server-wide daily.dev token

An optional app-owned token reserved for fallback, demo, or non-personal content access. It must not be used to infer personal user behavior.

### Rate limit

A daily.dev API constraint that connected-mode requests must respect. Rate-limit failures should produce recoverable user-facing states.

### Fallback

A degraded but usable behavior path when daily.dev data is unavailable. Demo mode and stored share pages must continue to work without daily.dev.

## Share and privacy

### Share snapshot

A static public record of a user's Devine state at one point in time. It does not update unexpectedly after creation.

### Public share page

An unauthenticated route that renders a share snapshot from a public snapshot ID.

### Public projection

The allowlisted data shape exposed on public share pages. It includes aggregate fields such as seniority level, seniority score, health state, top tags, speech bubble, generated date, and powered-by attribution.

### Private activity

Detailed user activity such as raw events, article lists, comments, user IDs, daily.dev profile IDs, tokens, and credentials. Private activity must not appear in public share snapshots.

### Soft deletion

A deletion model where share snapshots can be marked deleted while preserving enough metadata for retention and audit behavior.

### Retention cleanup

The process for removing old soft-deleted share data while preserving required private event, token history, and audit retention boundaries.

## Workflow

### Sprint card

A shippable engineering task listed in [docs/TASK_BREAKDOWN.md](docs/TASK_BREAKDOWN.md). Cards cite acceptance criteria and source docs.

### Acceptance criterion

A testable requirement identified by an AC ID under [docs/business/](docs/business/). Code changes should trace back to relevant acceptance criteria.

### Wiring card

A card that proves frontend and backend work together end-to-end in the running app.

### Complete check

The full merge gate defined in `package.json`: type checking, linting, formatting, unit tests, E2E tests, and build.

### Reset API

The local-only guarded endpoint for resetting development state. It must not be reachable in production.
