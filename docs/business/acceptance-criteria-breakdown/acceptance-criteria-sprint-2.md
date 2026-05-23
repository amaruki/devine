# Acceptance Criteria — Sprint 2

## User Stories in Scope

- **US-01** Devine’s product hook from the landing page in under 10 seconds — Visitor
- **US-04** Server-persisted demo mode without a daily.dev token — Developer
- **US-05** A dashboard centered on a rubber duck companion — Developer
- **US-12** Recent counted activity — Developer
- **US-13** Playful duck visuals, speech bubbles, and focused micro-animations — Developer
- **US-18** A 60-second demo path using a prepared judge demo account — Hackathon judge
- **US-20** Prepared judge demo accounts — Superadmin
- **partial US-14** Create, view, and soft-delete public static share snapshots — Developer

---

## US-01 — Devine’s product hook from the landing page in under 10 seconds (Visitor)

### AC-01.01 — Landing page first impression

```gherkin
Given the Visitor is using Devine
When landing page first impression
Then Page shows product name, tagline “Define your stack, develop your mind,” emotional subheadline, and primary CTA above the fold
```

### AC-01.02 — Product hook clarity

```gherkin
Given the Visitor is using Devine
When product hook clarity
Then A hackathon judge reviewing the landing page with a checklist can identify Devine as a daily.dev-powered virtual rubber duck learning companion within 10 seconds
```

### AC-01.03 — Landing page scope

```gherkin
Given the Visitor is using Devine
When landing page scope
Then Landing page focuses on narrative and CTA rather than detailed mechanics
```

---

## US-04 — Server-persisted demo mode without a daily.dev token (Developer)

### AC-04.01 — Demo mode entry

```gherkin
Given the Developer is using Devine
When demo mode entry
Then Authenticated user can enter demo mode without entering daily.dev credentials
```

### AC-04.02 — Server-persisted demo state

```gherkin
Given the Developer is using Devine
When server-persisted demo state
Then Demo persona, simulated activity, and pet state persist across sessions for the same Devine user
```

### AC-04.03 — Judge default persona

```gherkin
Given the Developer is using Devine
When judge default persona
Then Demo mode defaults to Code Monkey
```

### AC-04.04 — Demo personas

```gherkin
Given the Developer is using Devine
When demo personas
Then User can view Copaster, Code Monkey, Scholar, and Philosopher behavior patterns
```

### AC-04.05 — Demo reset

```gherkin
Given the Developer is using Devine
When demo reset
Then User can reset server-persisted demo state from settings
```

### AC-04.06 — API independence

```gherkin
Given the Developer is using Devine
When aPI independence
Then Demo mode works when daily.dev API requests fail
```

### AC-04.07 — Mocked future modules

```gherkin
Given the Developer is using Devine
When mocked future modules
Then Before quests, inventory, or full sharing ship, demo dashboard areas may render clearly labeled demo or mocked states without implying unavailable persisted behavior
```

---

## US-05 — A dashboard centered on a rubber duck companion (Developer)

### AC-05.01 — Dashboard hierarchy

```gherkin
Given the Developer is using Devine
When dashboard hierarchy
Then Dashboard shows pet hero, speech bubble, core stats, recent activity, onboarding, and demo controls where applicable
```

### AC-05.02 — Companion prominence

```gherkin
Given the Developer is using Devine
When companion prominence
Then Rubber duck is visually dominant on the dashboard
```

### AC-05.03 — Embedded onboarding

```gherkin
Given the Developer is using Devine
When embedded onboarding
Then First-use guidance appears in the dashboard and does not block core use
```

### AC-05.04 — Future module states

```gherkin
Given the Developer is using Devine
When future module states
Then Next best action, quests, power-ups, and breakdown can render as mocked or unavailable states until their sprint scope ships
```

---

## US-12 — Recent counted activity (Developer)

### AC-12.01 — Activity list

```gherkin
Given the Developer is using Devine
When activity list
Then Recent activity shows action type, post title, tags, energy earned, source, and timestamp
```

### AC-12.02 — Source normalization

```gherkin
Given the Developer is using Devine
When source normalization
Then API, in-app, manual, and demo events use one normalized event shape
```

### AC-12.03 — Missing API fields

```gherkin
Given the Developer is using Devine
When missing API fields
Then Unavailable API fields are handled gracefully without breaking the activity list
```

---

## US-13 — Playful duck visuals, speech bubbles, and focused micro-animations (Developer)

### AC-13.01 — Duck variants

```gherkin
Given the Developer is using Devine
When duck variants
Then App includes SVG/React duck variants for Ignorant Copaster, Code Monkey, Grounded Scholar, Tech Philosopher, and Hibernating/Critical
```

### AC-13.02 — Speech bubbles

```gherkin
Given the Developer is using Devine
When speech bubbles
Then Duck speech uses deterministic templates with level, health state, top tags, recent bookmarks, and weakest score area
```

### AC-13.03 — Developer satire

```gherkin
Given the Developer is using Devine
When developer satire
Then Speech uses developer slang and satire while staying playful, avoiding direct insults about the user’s ability, identity, or background
```

### AC-13.04 — Focused animations

```gherkin
Given the Developer is using Devine
When focused animations
Then UI includes one polished idle animation and state-specific visual treatments for health or seniority changes
```

### AC-13.05 — Visual tone

```gherkin
Given the Developer is using Devine
When visual tone
Then UI combines elegant dark developer interface with chaotic duck personality
```

---

## US-18 — A 60-second demo path using a prepared judge demo account (Hackathon judge)

### AC-18.01 — Demo path start

```gherkin
Given the Hackathon judge is using Devine
When demo path start
Then Judge can start from landing page, log in with a prepared judge demo account, and enter demo mode
```

### AC-18.02 — Cause and effect

```gherkin
Given the Hackathon judge is using Devine
When cause and effect
Then Simulation buttons show activity, energy gain, quest progress, power-up reward, and visible duck state change
```

### AC-18.03 — Evolution moment

```gherkin
Given the Hackathon judge is using Devine
When evolution moment
Then Demo path can show seniority or health state movement within 60 seconds
```

### AC-18.04 — Share finish

```gherkin
Given the Hackathon judge is using Devine
When share finish
Then Demo path ends with a public or publicly previewable static share snapshot
```

### AC-18.05 — Credential independence

```gherkin
Given the Hackathon judge is using Devine
When credential independence
Then The 60-second demo can complete without live daily.dev API success, while the prepared judge account still demonstrates the connected-mode flow where credentials are available
```

### AC-18.06 — Demo account readiness

```gherkin
Given the Hackathon judge is using Devine
When demo account readiness
Then Prepared judge demo accounts include server-persisted demo state sufficient to show the full 60-second path
```

### AC-18.07 — Demo completion analytics

```gherkin
Given the Hackathon judge is using Devine
When demo completion analytics
Then Devine records one `demo_completed` event after landing view, login, demo mode entry, simulation action, visible energy or health change, quest progress or completion, and static share creation or preview
```

---

## US-20 — Prepared judge demo accounts (Superadmin)

### AC-20.01 — Judge account seed

```gherkin
Given the Superadmin is using Devine
When judge account seed
Then Superadmin/app owner can provision prepared judge demo accounts using a seed script
```

### AC-20.02 — Judge account reset

```gherkin
Given the Superadmin is using Devine
When judge account reset
Then Superadmin/app owner can reset prepared judge demo account state before a demo using a controlled script or admin operation
```

---

## US-14 — Create, view, and soft-delete public static share snapshots (Developer)

### AC-14.01 — Snapshot creation

```gherkin
Given the Developer is using Devine
When snapshot creation
Then User can create a public static share snapshot from current pet state
```

### AC-14.02 — Public URL

```gherkin
Given the Developer is using Devine
When public URL
Then Snapshot is available at a public URL without authentication
```

### AC-14.03 — Static content

```gherkin
Given the Developer is using Devine
When static content
Then Snapshot does not change when the user’s later dashboard state changes
```

### AC-14.04 — Safe fields

```gherkin
Given the Developer is using Devine
When safe fields
Then Snapshot shows aggregate signals such as seniority, score, health state, top tags, and quote
```

### AC-14.05 — Sensitive data exclusion

```gherkin
Given the Developer is using Devine
When sensitive data exclusion
Then Snapshot excludes token, raw events, email, private IDs, and detailed user comments
```

### AC-14.06 — Snapshot deletion

```gherkin
Given the Developer is using Devine
When snapshot deletion
Then Authenticated owner can soft-delete a share snapshot after creation
```

### AC-14.07 — Deleted snapshot behavior

```gherkin
Given the Developer is using Devine
When deleted snapshot behavior
Then Soft-deleted public snapshot URL returns a branded deleted page with HTTP 410 Gone and does not expose snapshot content
```

### AC-14.08 — Snapshot ownership

```gherkin
Given the Developer is using Devine
When snapshot ownership
Then A user cannot soft-delete another user’s share snapshot
```

### AC-14.09 — Snapshot retention

```gherkin
Given the Developer is using Devine
When snapshot retention
Then Soft-deleted snapshot records remain unavailable publicly and are retained server-side for up to 90 days with minimal audit/debug payload where possible
```

### AC-14.10 — Minimal share slice

```gherkin
Given the Developer is using Devine
When minimal share slice
Then A minimal static public share slice is available for the Sprint 2 judge demo path, while full share management remains in Sprint 5
```

---
