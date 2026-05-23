# Acceptance Criteria — Sprint 1

## User Stories in Scope

- **US-02** A Devine account with username and password — Developer
- **US-06** Daily energy from reading, curating, discussing, and sharing daily.dev posts — Developer
- **US-07** Health change based on daily learning progress and missed days — Developer
- **US-08** A 7-day seniority level and score breakdown — Developer
- **US-16** Raw activity events, daily pet snapshots, inventory, quests, demo state, audit events, and placeholder daily.dev ownership — Developer
- **US-19** Devine with production-grade safety, retention, and reliability — Developer
- **US-22** Daily activity evaluated in my locale — Developer

---

## US-02 — A Devine account with username and password (Developer)

### AC-02.01 — Account creation

```gherkin
Given the Developer is using Devine
When account creation
Then User can create a Devine account with a unique username and password
```

### AC-02.02 — Account login

```gherkin
Given the Developer is using Devine
When account login
Then User can log in with username and password
```

### AC-02.03 — Password security

```gherkin
Given the Developer is using Devine
When password security
Then Passwords are hashed server-side and never stored or exposed in plaintext
```

### AC-02.04 — Future OAuth compatibility

```gherkin
Given the Developer is using Devine
When future OAuth compatibility
Then Account model does not block adding OAuth providers later
```

### AC-02.05 — Account-bound foundation

```gherkin
Given the Developer is using Devine
When account-bound foundation
Then Authenticated user-owned records can be associated with the Devine user account, including activity events, daily snapshots, demo state, audit events, and placeholder daily.dev connection ownership
```

### AC-02.06 — Auth-required private pages

```gherkin
Given the Developer is using Devine
When auth-required private pages
Then Dashboard and settings require an authenticated Devine user
```

### AC-02.07 — Public route exception

```gherkin
Given the Developer is using Devine
When public route exception
Then Public share snapshot pages remain accessible without authentication
```

### AC-02.08 — Unauthorized access

```gherkin
Given the Developer is using Devine
When unauthorized access
Then Unauthenticated users attempting private routes are redirected or shown an auth prompt
```

### AC-02.09 — Account isolation

```gherkin
Given the Developer is using Devine
When account isolation
Then One user cannot access another user’s token placeholder, private events, inventory, demo state, or private snapshots, verified with RBAC unit tests
```

### AC-02.10 — Username uniqueness

```gherkin
Given the Developer is using Devine
When username uniqueness
Then Given a username already exists after normalization, account creation with the same normalized username fails with a clear message and no duplicate account is created
```

### AC-02.11 — Username rules

```gherkin
Given the Developer is using Devine
When username rules
Then Usernames are 3 to 24 characters, normalize to lowercase for uniqueness, allow letters, numbers, and underscores, and must start with a letter or number
```

### AC-02.12 — Reserved usernames

```gherkin
Given the Developer is using Devine
When reserved usernames
Then Reserved usernames such as admin, api, auth, dashboard, settings, share, demo, support, root, and system cannot be registered
```

### AC-02.13 — Password policy

```gherkin
Given the Developer is using Devine
When password policy
Then Passwords must be at least 8 characters and include uppercase, lowercase, number, and symbol characters
```

### AC-02.14 — Session model

```gherkin
Given the Developer is using Devine
When session model
Then Auth uses cookie-backed sessions with JWT validation
```

### AC-02.15 — Session claims

```gherkin
Given the Developer is using Devine
When session claims
Then JWT includes user ID, username, role, session ID, issued-at, expiry, and token version
```

### AC-02.16 — Session expiry

```gherkin
Given the Developer is using Devine
When session expiry
Then Sessions expire after 7 days and are refreshed when the user logs in successfully
```

### AC-02.17 — Optional email

```gherkin
Given the Developer is using Devine
When optional email
Then User can create an account without email, and recovery features remain unavailable until an email is added
```

---

## US-06 — Daily energy from reading, curating, discussing, and sharing daily.dev posts (Developer)

### AC-06.01 — Read reward

```gherkin
Given the Developer is using Devine
When read reward
Then Marking or opening a tracked post grants +10 energy up to 5 reads per user-local day
```

### AC-06.02 — Upvote reward

```gherkin
Given the Developer is using Devine
When upvote reward
Then Confirming an upvote grants +3 energy up to 10 upvotes per user-local day
```

### AC-06.03 — Bookmark reward

```gherkin
Given the Developer is using Devine
When bookmark reward
Then Bookmarking or confirming a bookmark grants +5 energy up to 5 bookmarks per user-local day
```

### AC-06.04 — Discussion reward

```gherkin
Given the Developer is using Devine
When discussion reward
Then Confirming a comment or joined discussion grants +15 energy up to 3 discussion actions per user-local day
```

### AC-06.05 — Share reward

```gherkin
Given the Developer is using Devine
When share reward
Then Sharing or confirming a share grants +12 energy up to 3 shares per user-local day
```

### AC-06.06 — Daily cap handling

```gherkin
Given the Developer is using Devine
When daily cap handling
Then Actions beyond their daily cap are recorded but do not add more energy
```

### AC-06.07 — Daily target visibility

```gherkin
Given the Developer is using Devine
When daily target visibility
Then Dashboard clearly shows the daily energy target of 50
```

### AC-06.08 — Automatic activity fallback

```gherkin
Given the Developer is using Devine
When automatic activity fallback
Then If daily.dev does not expose a required activity history signal, the user can report the action in-app and the event is marked with source `manual`
```

### AC-06.09 — Event sources

```gherkin
Given the Developer is using Devine
When event sources
Then Activity events store source as `dailydev_api`, `in_app`, `manual`, or `demo`
```

### AC-06.10 — Idempotent activity submission

```gherkin
Given the Developer is using Devine
When idempotent activity submission
Then Repeating the same client-generated idempotency key for the same user returns the existing result and does not grant duplicate energy
```

### AC-06.11 — API event deduplication

```gherkin
Given the Developer is using Devine
When aPI event deduplication
Then Reusing the same daily.dev API event ID for the same user does not grant duplicate energy
```

### AC-06.12 — Daily cap reset

```gherkin
Given the Developer is using Devine
When daily cap reset
Then Product energy caps reset at user-local midnight
```

---

## US-07 — Health change based on daily learning progress and missed days (Developer)

### AC-07.01 — Target met

```gherkin
Given the Developer is using Devine
When target met
Then Daily energy of 50 or more applies +5 health
```

### AC-07.02 — Partial progress

```gherkin
Given the Developer is using Devine
When partial progress
Then Daily energy of 30 to 49 applies 0 health change
```

### AC-07.03 — Low progress

```gherkin
Given the Developer is using Devine
When low progress
Then Daily energy of 10 to 29 applies -8 health
```

### AC-07.04 — Minimal progress

```gherkin
Given the Developer is using Devine
When minimal progress
Then Daily energy of 1 to 9 applies -12 health
```

### AC-07.05 — No progress

```gherkin
Given the Developer is using Devine
When no progress
Then Daily energy of 0 applies -20 health
```

### AC-07.06 — Health clamp

```gherkin
Given the Developer is using Devine
When health clamp
Then Health never falls below 0 or above 100
```

### AC-07.07 — Missed-day processing

```gherkin
Given the Developer is using Devine
When missed-day processing
Then Missed-day decay is calculated from authoritative daily snapshots when the dashboard opens and is applied at most once per user-local day
```

### AC-07.08 — Recoverable bottom state

```gherkin
Given the Developer is using Devine
When recoverable bottom state
Then Hibernating is the lowest state and can be recovered from
```

### AC-07.09 — Visual health state

```gherkin
Given the Developer is using Devine
When visual health state
Then Duck visual state maps to Thriving, Stable, Tired, Sick, Critical, or Hibernating
```

---

## US-08 — A 7-day seniority level and score breakdown (Developer)

### AC-08.01 — Seniority levels

```gherkin
Given the Developer is using Devine
When seniority levels
Then Score maps to 0 to 24 Ignorant Copaster, 25 to 49 Code Monkey, 50 to 79 Grounded Scholar, and 80 to 100 Tech Philosopher
```

### AC-08.02 — Rolling window

```gherkin
Given the Developer is using Devine
When rolling window
Then Seniority uses the last 7 user-local days of activity and stored daily snapshots
```

### AC-08.03 — Score components

```gherkin
Given the Developer is using Devine
When score components
Then Breakdown shows Reading Consistency, Topic Variety, Curation, Discussion, Social Contribution, and Deep Tech Signals
```

### AC-08.04 — Component weights

```gherkin
Given the Developer is using Devine
When component weights
Then Components use weights 30 Reading Consistency, 15 Topic Variety, 20 Curation, 20 Discussion, 10 Social Contribution, and 5 Deep Tech Signals
```

### AC-08.05 — Reading Consistency formula

```gherkin
Given the Developer is using Devine
When reading Consistency formula
Then Reading Consistency is `(daysWithAtLeastOneRead / 7) * 30`
```

### AC-08.06 — Topic Variety formula

```gherkin
Given the Developer is using Devine
When topic Variety formula
Then Topic Variety is `min(uniqueTags / 8, 1) * 15`
```

### AC-08.07 — Curation formula

```gherkin
Given the Developer is using Devine
When curation formula
Then Curation is `min((bookmarks + upvotes) / 10, 1) * 20`
```

### AC-08.08 — Discussion formula

```gherkin
Given the Developer is using Devine
When discussion formula
Then Discussion is `min(comments / 3, 1) * 20`
```

### AC-08.09 — Social Contribution formula

```gherkin
Given the Developer is using Devine
When social Contribution formula
Then Social Contribution is `min(shares / 3, 1) * 10`
```

### AC-08.10 — Deep Tech Signals formula

```gherkin
Given the Developer is using Devine
When deep Tech Signals formula
Then Deep Tech Signals is `min(deepTechTaggedEvents / 5, 1) * 5`
```

### AC-08.11 — Score rounding

```gherkin
Given the Developer is using Devine
When score rounding
Then Final seniority score is rounded to the nearest integer
```

### AC-08.12 — Deep tag recognition

```gherkin
Given the Developer is using Devine
When deep tag recognition
Then Deep technology signals count architecture, system-design, distributed-systems, security, ai, machine-learning, devops, cloud, database, performance, and observability
```

### AC-08.13 — Tag normalization

```gherkin
Given the Developer is using Devine
When tag normalization
Then Tags are lowercased, spaces become hyphens, and aliases such as ml, system design, cybersecurity, and sre are mapped
```

### AC-08.14 — Health versus seniority speed

```gherkin
Given the Developer is using Devine
When health versus seniority speed
Then Health reacts to daily neglect faster than seniority level changes
```

---

## US-16 — Raw activity events, daily pet snapshots, inventory, quests, demo state, audit events, and placeholder daily.dev ownership (Developer)

### AC-16.01 — Raw events

```gherkin
Given the Developer is using Devine
When raw events
Then Raw activity events are persisted with source, event type, tags, timestamp, idempotency metadata, daily.dev API event ID where available, and energy metadata
```

### AC-16.02 — Daily snapshots

```gherkin
Given the Developer is using Devine
When daily snapshots
Then Daily pet snapshots are persisted as authoritative records for stable dashboard and share rendering
```

### AC-16.03 — Inventory persistence

```gherkin
Given the Developer is using Devine
When inventory persistence
Then Power-up inventory and active power-up effects persist for the authenticated user
```

### AC-16.04 — Quest persistence

```gherkin
Given the Developer is using Devine
When quest persistence
Then Quest progress and completion state persist for the authenticated user
```

### AC-16.05 — Demo persistence

```gherkin
Given the Developer is using Devine
When demo persistence
Then Demo state persists server-side for the authenticated user
```

### AC-16.06 — Recalculation support

```gherkin
Given the Developer is using Devine
When recalculation support
Then Stored raw events are sufficient to support an explicit admin recalculation if formulas change, but formula changes apply only to future authoritative snapshots by default
```

### AC-16.07 — Timezone persistence

```gherkin
Given the Developer is using Devine
When timezone persistence
Then User timezone is stored from browser timezone at signup or first dashboard load and can be changed later in settings
```

### AC-16.08 — Timezone change behavior

```gherkin
Given the Developer is using Devine
When timezone change behavior
Then Changing timezone does not recalculate past authoritative daily snapshots
```

### AC-16.09 — Audit persistence

```gherkin
Given the Developer is using Devine
When audit persistence
Then Audit events persist for security, GDPR, and demo support actions
```

---

## US-19 — Devine with production-grade safety, retention, and reliability (Developer)

### AC-19.01 — Production deployment

```gherkin
Given the Developer is using Devine
When production deployment
Then App can run in a production deployment with persistent database-backed state
```

### AC-19.02 — Secret handling

```gherkin
Given the Developer is using Devine
When secret handling
Then Encryption keys, database credentials, auth secrets, and server tokens are stored only in environment variables or secure hosting secrets
```

### AC-19.03 — Input validation

```gherkin
Given the Developer is using Devine
When input validation
Then User-controlled inputs such as token submission, snapshot IDs, simulation actions, and settings mutations are validated server-side
```

### AC-19.04 — Private data protection

```gherkin
Given the Developer is using Devine
When private data protection
Then Token values, raw private activity, user identifiers, and private settings are never exposed in public routes
```

### AC-19.05 — Component fallbacks

```gherkin
Given the Developer is using Devine
When component fallbacks
Then Production UI shows component-level recoverable errors for auth, API, database, validation, and rate-limit failures
```

### AC-19.06 — Idempotent mutations

```gherkin
Given the Developer is using Devine
When idempotent mutations
Then Repeated activity submissions, quest claims, power-up use, and snapshot deletion do not create duplicate or corrupted state
```

### AC-19.07 — Auditability

```gherkin
Given the Developer is using Devine
When auditability
Then Critical user actions such as token connect, token validation failure, disconnect, snapshot create/delete, demo reset, quest reward grant, power-up use, login success, failed login, account recovery request, and superadmin judge account reset are persisted or traceable enough to debug production issues
```

### AC-19.08 — Retention policy

```gherkin
Given the Developer is using Devine
When retention policy
Then Soft-deleted snapshots are retained for 90 days, raw private events for 30 days, token connection history for 30 days, and audit records for 90 days
```

---

## US-22 — Daily activity evaluated in my locale (Developer)

### AC-22.01 — User-local day boundary

```gherkin
Given the Developer is using Devine
When user-local day boundary
Then Daily energy caps, health processing, quests, and seniority windows use the user’s stored timezone
```

---
