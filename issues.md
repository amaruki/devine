# Devine MVP Issue Breakdown

These issues are tracer-bullet vertical slices for implementing the Devine MVP from `prd.md`. They are written as local markdown issues because this repo has no configured issue tracker.

## Proposed Breakdown Summary

1. **Bootstrap the Devine app shell**
   - **Type:** AFK
   - **Blocked by:** None
   - **User stories covered:** 1, 2, 55, 56

2. **Ship demo-mode dashboard with Code Monkey default**
   - **Type:** AFK
   - **Blocked by:** 1
   - **User stories covered:** 6, 7, 8, 9, 10, 22, 23, 24, 25, 52, 53, 54, 71

3. **Implement core scoring and health engine**
   - **Type:** AFK
   - **Blocked by:** 1
   - **User stories covered:** 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36

4. **Wire dashboard simulation events through real scoring**
   - **Type:** AFK
   - **Blocked by:** 2, 3
   - **User stories covered:** 11, 12, 13, 14, 15, 16, 17, 18, 19, 28, 51, 54, 71

5. **Add quests, personalized nudges, and power-up inventory**
   - **Type:** AFK
   - **Blocked by:** 3, 4
   - **User stories covered:** 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50

6. **Add persistent storage for users, events, snapshots, and inventory**
   - **Type:** AFK
   - **Blocked by:** 3, 4
   - **User stories covered:** 20, 51, 68, 69

7. **Implement daily.dev token connection and secure storage**
   - **Type:** AFK
   - **Blocked by:** 6
   - **User stories covered:** 3, 4, 5, 65, 66, 67

8. **Sync daily.dev content into Devine activity context**
   - **Type:** AFK
   - **Blocked by:** 7
   - **User stories covered:** 3, 11, 13, 35, 36, 49, 51, 65, 67

9. **Build lightweight SVG duck variants and motion states**
   - **Type:** AFK
   - **Blocked by:** 2
   - **User stories covered:** 8, 9, 21, 22, 23, 55, 56, 57, 58

10. **Create public static share snapshots**
    - **Type:** AFK
    - **Blocked by:** 6, 9
    - **User stories covered:** 60, 61, 62, 63, 64, 69, 71

11. **Polish onboarding, empty states, and hackathon demo path**
    - **Type:** HITL
    - **Blocked by:** 4, 5, 8, 10
    - **User stories covered:** 1, 2, 48, 49, 50, 59, 65, 71

---

## Issue 1: Bootstrap the Devine app shell

## What to build

Create the initial Devine web application shell with the approved stack: Next.js, TypeScript, Tailwind CSS, motion, Drizzle-ready project structure, and Vercel-friendly configuration. The first vertical slice should render the landing page, dashboard route, settings route, and share route as navigable placeholders with Devine branding.

The landing page should communicate the product quickly with the name **Devine**, the tagline **“Define your stack, develop your mind.”**, a short emotional subheadline, and CTAs for connecting daily.dev or trying demo mode.

## Acceptance criteria

- [ ] The app runs locally with the chosen Next.js + TypeScript + Tailwind stack.
- [ ] The landing page displays Devine branding, tagline, emotional subheadline, and primary/secondary CTAs.
- [ ] Dashboard, settings, and share routes exist and are reachable from the app shell.
- [ ] The visual direction starts with an elegant dark developer UI and rubber-duck/yellow accent language.
- [ ] The project has a basic pattern for reusable UI primitives and domain modules.

## Blocked by

None - can start immediately.

---

## Issue 2: Ship demo-mode dashboard with Code Monkey default

## What to build

Create the first complete dashboard experience using demo data only. The dashboard should default to **Si Pekerja Mekanis / The Code Monkey** and show the core Devine hierarchy: pet hero, seniority title, health state, energy today, speech bubble, next best action, core stats, seniority breakdown placeholder, quest placeholder, power-up placeholder, recent activity placeholder, and demo controls.

This slice should be demoable without daily.dev credentials or a database.

## Acceptance criteria

- [ ] Dashboard defaults to Code Monkey demo state.
- [ ] Dashboard shows pet hero, seniority title, health, energy, speech bubble, and next best action.
- [ ] Dashboard includes visible areas for quests, power-ups, seniority breakdown, recent activity, and demo controls.
- [ ] Demo controls include read, upvote, bookmark, comment, share, complete quest, and use power-up buttons, even if not fully wired yet.
- [ ] The dashboard can be used in a hackathon demo without a token.

## Blocked by

- Issue 1

---

## Issue 3: Implement core scoring and health engine

## What to build

Build the pure domain engine that calculates Devine’s energy, health, health visual state, seniority score, seniority level, deep-tag normalization, and missed-day health changes. This module should be independent of the UI, database, and daily.dev API so it can be tested thoroughly.

The engine should encode the agreed rules: daily target 50 energy, per-action energy/caps, health decay bands, 7-day normalized seniority components, seniority thresholds, and deep-tech tag aliases.

## Acceptance criteria

- [ ] Energy calculation applies read/upvote/bookmark/comment/share values and daily caps.
- [ ] Health calculation applies the agreed energy bands and clamps health to 0–100.
- [ ] Health maps to Thriving, Stable, Tired, Sick, Critical, and Hibernating.
- [ ] Missed-day processing can apply health decay without a background worker.
- [ ] Seniority score calculates Reading Consistency, Topic Variety, Curation, Discussion, Social Contribution, and Deep Tech Signals over 7 days.
- [ ] Seniority score maps to Ignorant Copaster, Code Monkey, Grounded Scholar, or Tech Philosopher.
- [ ] Deep-tech tags and aliases normalize consistently.
- [ ] Unit tests cover the scoring and state mapping behavior.

## Blocked by

- Issue 1

---

## Issue 4: Wire dashboard simulation events through real scoring

## What to build

Connect the demo dashboard controls to the scoring engine so simulated actions produce real changes in energy, health, seniority breakdown, recent activity, speech context, and next best action. This should make the product’s cause-and-effect loop visible before persistence or daily.dev integration exists.

## Acceptance criteria

- [ ] Clicking read/upvote/bookmark/comment/share records a demo activity event.
- [ ] Simulated events update Energy Today using the real scoring rules and daily caps.
- [ ] Simulated events update seniority breakdown using the real 7-day scoring rules.
- [ ] Recent activity displays action type, post title or demo label, tags, energy earned, and timestamp.
- [ ] The next best action changes based on the weakest score area.
- [ ] The demo can show progression from Code Monkey toward Grounded Scholar.

## Blocked by

- Issue 2
- Issue 3

---

## Issue 5: Add quests, personalized nudges, and power-up inventory

## What to build

Implement the quest and power-up loop end-to-end in demo mode. Users should see daily quests, one personalized quest based on weakest seniority component, and the weekly five-day learning streak quest. Completing quests should grant power-ups into inventory, and using power-ups should affect energy/health without changing seniority directly.

## Acceptance criteria

- [ ] Daily quests include Feed the Duck, Future-You Bookmark, and Touch Grass, But Online.
- [ ] Personalized quest selection is based on weakest seniority component.
- [ ] Weekly quest tracks five active reading days in a 7-day window.
- [ ] Quest completion grants the correct power-up.
- [ ] Inventory displays Snack, Medicine, Knowledge Gem, Social Boost, and Revive Feather counts.
- [ ] Snack adds energy today.
- [ ] Medicine restores health.
- [ ] Knowledge Gem doubles the next read energy reward only.
- [ ] Social Boost doubles the next comment/share energy reward only.
- [ ] Revive Feather recovers only from Critical/Hibernating range.
- [ ] Power-ups do not directly change seniority score.
- [ ] Unit tests cover quest selection and power-up effects.

## Blocked by

- Issue 3
- Issue 4

---

## Issue 6: Add persistent storage for users, events, snapshots, and inventory

## What to build

Add Drizzle and Neon Postgres persistence for Devine’s core state. Store users, normalized activity events, daily pet snapshots, power-up inventory, active power-up effects, optional quest state, and share snapshots. The app should continue to support demo mode while persisting enough state for connected mode and share snapshots.

## Acceptance criteria

- [ ] Database schema supports users, activity events, daily pet snapshots, inventory, active power-up effects, daily.dev connections, and share snapshots.
- [ ] Activity events preserve type, source, post metadata, tags, energy earned, occurrence time, and metadata.
- [ ] Daily snapshots preserve energy, health, health state, seniority score, seniority level, score breakdown, completed quests, and earned power-ups.
- [ ] Dashboard can load state from persistence when available.
- [ ] Demo mode can persist simulated events and snapshots or intentionally reset via settings.
- [ ] Storage behavior is covered by integration tests or repository-level tests where practical.

## Blocked by

- Issue 3
- Issue 4

---

## Issue 7: Implement daily.dev token connection and secure storage

## What to build

Implement the settings flow for connecting a user-provided daily.dev Personal Access Token. The token must be encrypted server-side before persistence, validated against the daily.dev API, and removable through disconnect/delete actions. The browser must never receive the raw token after submission.

## Acceptance criteria

- [ ] Settings page accepts a daily.dev Personal Access Token.
- [ ] Token is validated server-side before marking the connection active.
- [ ] Token is encrypted before database storage.
- [ ] Token is never exposed to client components or localStorage.
- [ ] User can disconnect daily.dev and delete the stored token.
- [ ] User can switch back to demo mode.
- [ ] API failures and rate-limit responses are handled gracefully.
- [ ] Security behavior is covered by tests for encryption/deletion boundaries where practical.

## Blocked by

- Issue 6

---

## Issue 8: Sync daily.dev content into Devine activity context

## What to build

Use the connected daily.dev token to fetch available personalized data and map it into Devine’s activity context. The first API-backed slice should fetch profile/feed/bookmark/post/tag data where available, merge it with Devine-tracked events, and use it to enrich dashboard recommendations, recent activity, tag variety, and deep-tech signals.

Where daily.dev does not expose read/upvote/comment/share history, continue using Devine’s in-app tracking and user confirmations.

## Acceptance criteria

- [ ] Connected mode fetches available profile data from daily.dev.
- [ ] Connected mode fetches feed/post data and maps titles, URLs, IDs, and tags/topics.
- [ ] Connected mode fetches bookmarks if available and maps them into the activity context.
- [ ] daily.dev tags are normalized for topic variety and deep-tech scoring.
- [ ] API-derived data and in-app tracked events can coexist in the dashboard.
- [ ] If an API capability is unavailable, the UI falls back to Devine tracking without breaking the demo.
- [ ] Rate-limit and auth errors produce useful fallback states.

## Blocked by

- Issue 7

---

## Issue 9: Build lightweight SVG duck variants and motion states

## What to build

Create the manually authored SVG/React duck avatar system for Devine. It should support the four seniority personas plus hibernating/critical state and lightweight motion effects. Visuals should match the elegant/chaotic direction: polished developer UI surrounding a satirical rubber duck.

## Acceptance criteria

- [ ] Duck avatar supports Ignorant Copaster, Code Monkey, Grounded Scholar, Tech Philosopher, and Hibernating/Critical variants.
- [ ] Avatar responds to health state visually.
- [ ] Motion states include idle bobbing, glow, shake, glitch, melt/suspended, sparkle, and energy pulse where appropriate.
- [ ] SVG/React implementation is lightweight and does not require a heavy asset pipeline.
- [ ] Dashboard uses the avatar instead of placeholder art.
- [ ] Reduced-motion/accessibility behavior is considered for animations.

## Blocked by

- Issue 2

---

## Issue 10: Create public static share snapshots

## What to build

Implement privacy-safe public share snapshots. Users should be able to generate a static snapshot from their current Devine state and open it at a public URL. The page should show pet visual, seniority level, score, health state, top tags, witty quote, generated date/week, and daily.dev attribution.

## Acceptance criteria

- [ ] User can generate a share snapshot from dashboard state.
- [ ] Snapshot is static and does not change when the user’s future dashboard state changes.
- [ ] Public share URL renders without authentication.
- [ ] Share page includes only allowed aggregate data.
- [ ] Share page excludes token, email, private IDs, raw activity events, detailed comments, and embarrassing detailed inactivity history.
- [ ] Share page uses the duck avatar visual and product branding.
- [ ] Share snapshot creation is covered by tests for privacy-safe field selection.

## Blocked by

- Issue 6
- Issue 9

---

## Issue 11: Polish onboarding, empty states, and hackathon demo path

## What to build

Finalize the MVP experience for a hackathon judge and first-time developer. Add brief dashboard onboarding cards, clearer empty/error states, fallback messaging, positive anti-doomscrolling copy, and a smooth 60-second golden path from landing page to dashboard to activity simulation/connected data to quest/power-up to share snapshot.

This is marked HITL because final tone, copy, and presentation polish benefit from human review.

## Acceptance criteria

- [ ] Landing page communicates Devine in under 10 seconds.
- [ ] Dashboard includes brief onboarding cards without blocking use.
- [ ] Empty states explain what to do next in demo and connected modes.
- [ ] API/token failure states explain fallback options without exposing sensitive details.
- [ ] Next best action copy is positive and avoids shaming.
- [ ] Speech bubble tone remains playful satire, not direct insult.
- [ ] The 60-second demo path works reliably from a fresh app state.
- [ ] Human review approves final wording and visual polish.

## Blocked by

- Issue 4
- Issue 5
- Issue 8
- Issue 10
