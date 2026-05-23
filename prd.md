# PRD: Devine MVP

## Problem Statement

Developers often consume technology content passively: they click posts, skim articles, copy solutions, and move on without building a durable learning habit. daily.dev already provides a strong source of community-curated developer content, but a user may still need motivation, feedback, and playful accountability to turn that content into consistent learning, curation, and discussion.

For the daily.dev hackathon, the product needs to demonstrate a compelling, developer-native use of daily.dev data/API that is easy to understand quickly, works reliably in a live demo, and produces a shareable output. The challenge is to create something more memorable than a generic streak tracker or bookmark dashboard while still keeping the MVP feasible within hackathon constraints.

## Solution

Build **Devine**, a daily.dev-powered virtual rubber duck companion with the tagline: **“Define your stack, develop your mind.”**

Devine turns daily.dev learning signals into a playful evolution system. The user connects a daily.dev Personal Access Token or uses demo mode. The dashboard shows a rubber duck whose health, energy, seniority level, quests, power-ups, and speech bubbles reflect the user’s reading and engagement behavior.

The product uses a hybrid tracking model:

- daily.dev API provides feed content, posts, tags/topics, bookmarks, profile, tech stack, and other available personalized data.
- Devine tracks lightweight in-app learning events such as opening a post, marking read, sharing, confirming upvotes, and confirming discussions where the API does not expose personal history.

The duck does not use generic hunger/fullness states. Instead, it uses a satirical developer maturity system:

- **Si Dungu / The Ignorant Copaster** for low/no meaningful learning.
- **Si Pekerja Mekanis / The Code Monkey** for passive reading.
- **Sang Intelektual / The Grounded Scholar** for active curation and grounded learning.
- **Sang Filsuf / The Tech Philosopher** for reflective, high-quality engagement.

The MVP should be dashboard-first, with a landing page focused on emotional narrative and CTA, a settings page for daily.dev connection/demo fallback, and a public static share snapshot page.

## User Stories

1. As a hackathon judge, I want to understand Devine from the landing page in under 10 seconds, so that I can quickly grasp the product hook.
2. As a hackathon judge, I want to see the tagline “Define your stack, develop your mind,” so that I understand the brand positioning.
3. As a developer, I want to connect my daily.dev Personal Access Token, so that Devine can use my personalized daily.dev data.
4. As a developer, I want my token to be stored securely server-side, so that my daily.dev account remains protected.
5. As a developer, I want to disconnect daily.dev and delete my token, so that I remain in control of my data.
6. As a developer, I want a demo mode, so that I can try Devine without configuring a real token.
7. As a hackathon judge, I want demo mode to work without setup, so that the live demo does not depend on credentials or API reliability.
8. As a developer, I want the dashboard to show my rubber duck prominently, so that the companion feels like the center of the product.
9. As a developer, I want the duck to have a seniority level, so that my learning maturity is represented in a memorable way.
10. As a developer, I want the duck to have health, so that I can see whether my learning habit is currently healthy.
11. As a developer, I want the duck to gain energy from reading daily.dev posts, so that reading becomes part of the game loop.
12. As a developer, I want the duck to gain energy from upvoting posts, so that lightweight curation is rewarded.
13. As a developer, I want the duck to gain energy from bookmarking posts, so that saving useful content is rewarded.
14. As a developer, I want the duck to gain energy from commenting or joining discussions, so that active community participation is rewarded.
15. As a developer, I want the duck to gain energy from sharing posts, so that contribution beyond private reading is rewarded.
16. As a developer, I want each action type to have a daily cap, so that the system encourages meaningful behavior instead of farming.
17. As a developer, I want the daily energy target to be clear, so that I know what is needed to keep the duck stable.
18. As a developer, I want health to improve when I meet the daily target, so that consistent learning feels rewarding.
19. As a developer, I want health to decay gradually when I miss learning targets, so that the system is motivating but not unfair.
20. As a developer, I want missed days to be calculated when I open the dashboard, so that the MVP works without background jobs.
21. As a developer, I want hibernation to be the lowest state instead of permanent death, so that I can recover after falling behind.
22. As a developer, I want the duck’s visual state to change with health, so that the consequences are emotionally visible.
23. As a developer, I want the duck to show playful speech bubbles, so that the app feels alive and funny.
24. As a developer, I want speech bubbles to use developer slang and satire, so that Devine feels native to developer culture.
25. As a developer, I want the satire to be playful rather than insulting, so that I feel motivated instead of attacked.
26. As a developer, I want my seniority score to be based on the last 7 days, so that it reflects recent learning quality without changing too abruptly.
27. As a developer, I want health to change faster than seniority, so that daily neglect is visible while maturity remains more stable.
28. As a developer, I want seniority score to be broken down into components, so that I understand what is helping or hurting my level.
29. As a developer, I want reading consistency to contribute to seniority, so that showing up regularly matters.
30. As a developer, I want topic variety to contribute to seniority, so that I avoid staying in an echo chamber.
31. As a developer, I want bookmarks and upvotes to contribute to seniority, so that curation is valued.
32. As a developer, I want discussion to contribute to seniority, so that thoughtful community interaction is valued.
33. As a developer, I want sharing to contribute to seniority, so that social contribution is valued.
34. As a developer, I want deep technology signals to contribute to seniority, so that serious technical exploration is rewarded.
35. As a developer, I want deep tags such as architecture, system design, security, AI, machine learning, DevOps, cloud, database, performance, and observability to matter, so that deep learning is recognized.
36. As a developer, I want Devine to normalize tag aliases, so that scoring works across variations like “ml” and “machine-learning.”
37. As a developer, I want daily quests, so that I have clear short-term actions to take.
38. As a developer, I want a personalized quest based on my weakest score area, so that Devine nudges me toward better habits.
39. As a developer, I want a weekly quest for a five-day learning streak, so that consistent weekly behavior is rewarded.
40. As a developer, I want quests to grant power-ups, so that completing tasks feels game-like.
41. As a developer, I want power-ups to go into an inventory, so that I can choose when to use them.
42. As a developer, I want Snack to add energy, so that I can reach the daily target when close.
43. As a developer, I want Medicine to restore health, so that I can recover from low-health states.
44. As a developer, I want Knowledge Gem to double the next read reward, so that I am encouraged to read another article.
45. As a developer, I want Social Boost to double the next comment/share reward, so that I am encouraged to engage actively.
46. As a developer, I want Revive Feather to recover from hibernation, so that I can come back after neglect.
47. As a developer, I want power-ups to affect only energy and health, so that seniority remains grounded in real learning behavior.
48. As a developer, I want the dashboard to show a next best action, so that I know the most useful thing to do next.
49. As a developer, I want Devine to recommend action types first and tags/topics if possible, so that the MVP remains useful without overreaching API capabilities.
50. As a developer, I want positive anti-doomscrolling nudges, so that I am encouraged to curate or discuss rather than endlessly read.
51. As a developer, I want recent activity to show action type, post title, tags, energy earned, and timestamp, so that I understand what Devine counted.
52. As a developer, I want demo personas, so that I can immediately see how different behavior patterns affect the duck.
53. As a hackathon judge, I want the default demo persona to be Code Monkey, so that the demo starts from a recoverable midpoint.
54. As a hackathon judge, I want simulation buttons, so that I can see cause and effect quickly.
55. As a developer, I want the product to use an elegant dark developer UI, so that the app feels polished and serious.
56. As a developer, I want the duck to be chaotic and funny within that serious UI, so that Devine is memorable.
57. As a developer, I want the duck illustrations to be lightweight SVG/React components, so that the dashboard remains performant.
58. As a developer, I want micro-animations for idle, glow, shake, glitch, melt, sparkle, and energy pulse states, so that the pet feels alive.
59. As a developer, I want onboarding to be brief and embedded in the dashboard, so that I can start using the product immediately.
60. As a developer, I want a public share snapshot, so that I can share my Devine state.
61. As a hackathon judge, I want share snapshots to be public URLs, so that outputs are explorable without extra setup.
62. As a developer, I want share snapshots to be static, so that the shared card does not unexpectedly change later.
63. As a developer, I want share snapshots to hide sensitive data, so that sharing does not expose personal activity details or credentials.
64. As a developer, I want share snapshots to show aggregate signals like seniority, score, health state, top tags, and quote, so that the card is expressive but safe.
65. As a developer, I want Devine to fall back gracefully when daily.dev API requests fail, so that the app remains usable.
66. As a developer, I want the server-wide daily.dev token to be limited to fallback/demo/non-personal use, so that personal behavior is not incorrectly inferred from an app-owned account.
67. As a developer, I want the API integration to respect daily.dev rate limits, so that the app remains reliable.
68. As a developer, I want raw activity events stored, so that scoring can be recalculated later if formulas change.
69. As a developer, I want daily pet snapshots stored, so that the dashboard and share pages are stable and fast.
70. As a developer, I want the implementation to avoid full AI chat in the MVP, so that the core habit loop ships first.
71. As a hackathon judge, I want the 60-second demo path to show landing, connection/demo, dashboard, activity, energy gain, quest, power-up, evolution, and share snapshot, so that the project’s value is clear.

## Implementation Decisions

- Build a dashboard-first web app using Next.js, TypeScript, Tailwind CSS, motion, Drizzle ORM, Neon Postgres, and Vercel.
- Use BetterAuth only if daily.dev OAuth becomes clearly available; otherwise use user-provided daily.dev Personal Access Tokens for the MVP.
- Use the user-provided daily.dev Personal Access Token as the primary connected mode because the Public API is personalized by Bearer token.
- Use any server-wide daily.dev token only for fallback, demo, or non-personal content access.
- Store daily.dev Personal Access Tokens encrypted server-side and never expose them to the browser.
- Provide disconnect/delete-token controls.
- Implement demo mode as a first-class fallback, not a temporary stub.
- Use a hybrid tracking model: daily.dev API for available content/profile/bookmark/feed data, and Devine in-app tracking for actions the API does not expose reliably.
- Trust user-confirmed in-app actions with light friction for the MVP rather than building complex anti-cheat.
- Use daily energy as the fast-moving habit metric.
- Use health as the internal system state for survivability and visual condition.
- Use seniority as the displayed maturity narrative based on a 7-day quality score.
- Set daily energy target to 50.
- Set action energy/caps as: read +10 capped 5/day, upvote +3 capped 10/day, bookmark +5 capped 5/day, comment/join discussion +15 capped 3/day, share +12 capped 3/day.
- Apply health changes by daily energy: 50+ gives +5, 30–49 gives 0, 10–29 gives -8, 1–9 gives -12, and 0 gives -20.
- Clamp health between 0 and 100.
- Calculate missed-day health decay when the dashboard opens rather than using a cron/background worker.
- Define health visual states as Thriving, Stable, Tired, Sick, Critical, and Hibernating.
- Treat Hibernating as the lowest recoverable state, not permanent death.
- Use 7-day rolling seniority score from normalized components rather than raw action counts.
- Use seniority thresholds: 0–24 Ignorant Copaster, 25–49 Code Monkey, 50–79 Grounded Scholar, 80–100 Tech Philosopher.
- Calculate seniority score from Reading Consistency 30, Topic Variety 15, Curation 20, Discussion 20, Social Contribution 10, and Deep Tech Signals 5.
- Set Reading Consistency full target to 5 active reading days in 7 days.
- Set Topic Variety full target to 5 unique tags/topics in 7 days.
- Set Curation full target to 5 bookmarks plus 10 upvotes in 7 days.
- Set Discussion full target to 3 comments/joined discussions in 7 days.
- Set Social Contribution full target to 3 shares in 7 days.
- Set Deep Tech Signals full target to 3 deep-tag interactions in 7 days.
- Use a curated MVP deep-tag allowlist: architecture, system-design, distributed-systems, security, ai, machine-learning, devops, cloud, database, performance, and observability.
- Normalize tags by lowercasing, converting spaces to hyphens, and mapping aliases like ml to machine-learning, system design to system-design, cybersecurity to security, and sre to observability or devops.
- Implement daily quests: Feed the Duck, Future-You Bookmark, and Touch Grass, But Online.
- Implement one personalized quest based on the weakest seniority component.
- Implement weekly quest: Five-Day Learning Streak.
- Store power-ups in inventory and require manual use.
- Implement power-ups: Snack, Medicine, Knowledge Gem, Social Boost, and Revive Feather.
- Ensure power-ups affect only energy/health and never directly affect seniority score.
- Implement speech bubbles using templates plus lightweight contextual variables such as level, health state, top tags, recent bookmarks, and weakest score area.
- Do not implement full AI chat in the MVP; keep “Ask My Duck” as a stretch goal.
- Build SVG/React duck variants manually for Ignorant Copaster, Code Monkey, Grounded Scholar, Tech Philosopher, and Hibernating/Critical.
- Use motion/CSS for lightweight micro-animations.
- Build four primary routes: landing page, dashboard, settings, and public share snapshot.
- Landing page should focus on emotional narrative and CTA, not detailed mechanics.
- Dashboard should explain mechanics through hierarchy: pet, speech, next best action, core stats, quests/power-ups, breakdown, recent activity.
- Settings should handle token connection, connection testing, disconnect/delete, demo mode, and reset demo state.
- Share pages should use static public snapshots and expose only privacy-safe aggregate data.
- Store raw activity events as well as daily snapshots.
- Store share snapshots separately with public IDs.
- Keep image export/PNG generation out of MVP and treat it as a bonus.
- Keep leaderboard, browser extension, webhooks, background workers, full article analytics, and public social graph out of MVP.

### Major Modules

- **daily.dev API client module**: owns authenticated server-side calls to daily.dev, rate-limit-aware request handling, profile/feed/bookmark/post mapping, and failure handling.
- **Token security module**: owns encryption/decryption, token validation metadata, and disconnect/delete behavior.
- **Activity ingestion module**: normalizes events from daily.dev API, Devine tracking, and demo mode into a single activity event shape.
- **Scoring engine module**: pure, testable module for energy, caps, health, missed-day processing, seniority score, health state, seniority level, and tag normalization.
- **Quest engine module**: pure, testable module for daily quests, personalized quest selection, weekly quest progress, completion, and reward mapping.
- **Power-up engine module**: pure, testable module for inventory updates, power-up use rules, and next-action multiplier effects.
- **Speech bubble module**: deterministic template selector that combines duck state and lightweight context into playful copy.
- **Demo mode module**: provides persona presets and simulation actions that flow through the same activity/scoring systems as connected mode.
- **Persistence module**: Drizzle schema and queries for users, daily.dev connections, activity events, daily pet snapshots, power-up inventory, active power-up effects, quests if persisted, and share snapshots.
- **Dashboard UI module**: presents the pet hero, next best action, core stats, seniority breakdown, quests, power-ups, recent activity, onboarding cards, and demo controls.
- **Duck avatar module**: SVG/React component variants and motion states.
- **Share snapshot module**: creates privacy-safe static snapshots and renders public share pages.

## Testing Decisions

Good tests should verify externally visible behavior and stable contracts, not implementation details. The most important tests should focus on pure business logic modules because they encode the core product promise and can be tested without a browser, database, or daily.dev API access.

Modules recommended for tests:

- **Scoring engine**
  - Calculates daily energy with per-action caps.
  - Applies health changes for each energy band.
  - Clamps health between 0 and 100.
  - Maps health to visual states.
  - Calculates missed-day health decay.
  - Calculates 7-day seniority score from normalized components.
  - Maps seniority score to the correct seniority level.
  - Normalizes tags and deep-tag aliases.

- **Quest engine**
  - Generates required daily quests.
  - Selects the personalized quest from the weakest seniority component.
  - Tracks quest progress from activity events.
  - Grants the correct reward power-up.
  - Calculates weekly five-day learning streak completion.

- **Power-up engine**
  - Adds power-ups to inventory.
  - Applies Snack energy.
  - Applies Medicine health recovery.
  - Applies Knowledge Gem only to the next read.
  - Applies Social Boost only to the next comment/share.
  - Applies Revive Feather only in Critical/Hibernating health range.
  - Prevents power-ups from changing seniority score directly.

- **Activity ingestion module**
  - Maps API, in-app, and demo events to a normalized event shape.
  - Preserves source, event type, tags, timestamp, and energy-relevant metadata.
  - Handles unavailable API fields gracefully.

- **Share snapshot module**
  - Creates static snapshots from daily pet snapshots.
  - Includes only allowed public aggregate fields.
  - Excludes token, raw events, email, private IDs, and detailed user comments.

- **Token security module**
  - Encrypts before persistence.
  - Decrypts only server-side.
  - Deletes/disconnects token records when requested.

- **Demo mode module**
  - Defaults to Code Monkey.
  - Applies simulation events through the same scoring pipeline as real events.
  - Produces consistent persona states for Copaster, Code Monkey, Scholar, and Philosopher.

UI-level tests can be lighter for the MVP and should focus on user-observable flows:

- Landing page displays product name, tagline, emotional subheadline, and CTAs.
- Dashboard shows pet hero, speech bubble, next best action, stats, quests, inventory, breakdown, and recent activity.
- Settings page allows token entry, demo mode switching, and disconnect/delete affordances.
- Share page renders a public snapshot without sensitive fields.

Prior art in this repo is limited because the repository currently contains planning docs and skill definitions rather than an implemented application. New tests should therefore establish the project’s testing pattern around pure domain modules first.

## Out of Scope

- Full AI chat with the duck.
- Leaderboards.
- Browser extension or daily.dev overlay.
- Real-time webhooks.
- Background cron workers.
- Image export or PNG generation for share cards.
- Complex anti-cheat or activity verification.
- Advanced OAuth unless daily.dev clearly supports it.
- Full article reading analytics.
- Public social graph.
- Multi-pet selection beyond the rubber duck.
- Complex character rigging or asset pipeline.
- Full issue-tracker integration inside the app.

## Further Notes

The current repository appears to be a planning-only project rather than an initialized Next.js app. The MVP spec already exists in `mvp.md`; this PRD reformats and expands that product direction into implementation-ready requirements.

The daily.dev Public API documentation indicates Bearer-token authentication with a Personal Access Token and Plus/API access requirements. The hackathon context suggests participants may receive API access, but implementation should still support demo mode and graceful fallback.

The biggest feasibility risks are whether daily.dev exposes read history, personal upvote history, personal comment history, and share detection. The product decision is to avoid blocking on those risks by using Devine’s in-app tracking for unavailable behavioral events.

This PRD was prepared locally because no issue tracker configuration, project ID, or triage label system was available in the repository. When an issue tracker is configured, publish this PRD with the `ready-for-agent` label.
