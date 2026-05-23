Devine MVP Specification

1. Product Overview

Name: Devine
Tagline: Define your stack, develop your mind.

Concept:
Devine is a daily.dev-powered virtual rubber duck companion whose evolution reflects the user’s technology reading habits. The duck gains energy from
meaningful developer learning signals such as reading, bookmarking, upvoting, commenting, and sharing daily.dev posts.

Instead of using traditional pet states like hungry/full, Devine uses a satirical developer maturity system. The duck evolves from an Ignorant Copaster
into a Tech Philosopher as the user develops better reading, curation, and discussion habits.

Core hook:
A developer’s rubber duck becomes smarter when the developer learns from daily.dev. If the user passively consumes, ignores, or avoids meaningful
engagement, the duck regresses.

---

2. MVP Goal

Build a web dashboard that demonstrates:

1. daily.dev-connected reading habit tracking.
2. A virtual rubber duck whose energy and health depend on user activity.
3. A seniority system based on 7-day engagement quality.
4. Quests and power-ups that guide users toward better learning habits.
5. A shareable static public snapshot of the user’s Devine state.

The MVP should prioritize hackathon demo clarity over complete automation.

---

3. Target User

Developers who use daily.dev and want to build a more meaningful habit around reading, curating, and discussing technology content.

---

4. Core Product Philosophy

Devine is not just a Tamagotchi clone.

It is a playful critique of how developers learn:

- Passive clicking creates a Code Monkey.
- No reading creates an Ignorant Copaster.
- Active curation creates a Grounded Scholar.
- Reflective discussion and deep learning create a Tech Philosopher.

The app should reward meaningful learning, not empty activity farming.

---

5. Product Tone

Primary tone: elegant, developer-native, and philosophical.
Pet personality: chaotic, satirical, funny, and slightly unhinged.

Use English for the product UI, with developer slang, jokes, and satire.

Tone rules:

- Use playful satire, not personal insults.
- Mock developer habits, not the user directly.
- The duck regresses; the user is not called stupid.
- Keep humor memorable but not hostile.

Examples:

- It works on my machine. Therefore, architecture is optional.
- Your duck just tried to solve distributed systems with a global variable. Please read something.
- It copied a Stack Overflow answer from 2014 and called it architecture.
- A stack is not a belief system. Choose tools that expand human agency.

---

6. MVP Pages

6.1 Landing Page /

Purpose: emotional narrative + CTA.

Should include:

- Product name: Devine
- Tagline: Define your stack, develop your mind.
- Subheadline:

▎ A daily.dev-powered rubber duck that evolves with your reading habits — or regresses into an Ignorant Copaster.

Primary CTA:

- Connect daily.dev

Secondary CTA:

- Try Demo Mode

Three benefit cards:

1. Read with purpose
   Turn daily.dev activity into learning energy.
2. Evolve your duck
   Progress from Copaster to Tech Philosopher.
3. Escape the echo chamber
   Get quests that broaden your tech perspective.

Small preview:

- Rubber duck visual
- Seniority level
- Health/energy preview
- One quest card

---

6.2 Dashboard /dashboard

Main MVP surface.

Visual hierarchy:

1. Pet visual + seniority title
2. Speech bubble
3. Next best action
4. Core stats
5. Quest cards + power-up inventory
6. Breakdown + recent activity
7. Demo controls, only in demo mode

Dashboard sections:

A. Pet Hero

Shows:

- SVG rubber duck
- Seniority level
- Health state
- Speech bubble
- Micro-animation based on state

Example:

The Code Monkey
Health: Stable
Energy Today: 18 / 50

"I can set up NGINX, but please don't ask me why this architecture exists."

B. Next Best Action

Show one most important recommendation.

Examples:

- Join one discussion today to strengthen your Discussion score.
- You read enough today. Now bookmark one article future-you will thank you for.
- Escape the echo chamber: read one post outside your usual tags.

C. Core Stats

- Health
- Energy Today
- Seniority Score
- Current streak / active days this week

D. Seniority Breakdown

Show score breakdown:

Seniority Score: 62 / 100
Level: The Grounded Scholar

Reading Consistency: 24 / 30
Topic Variety: 9 / 15
Curation: 14 / 20
Discussion: 8 / 20
Social Contribution: 4 / 10
Deep Tech Signals: 3 / 5

E. Quests

Show:

- Daily quests
- Personalized quest
- Weekly quest

F. Power-Up Inventory

Show power-up cards with count and Use button.

G. Recent Activity

Show recent tracked events:

- Read article
- Upvoted post
- Bookmarked post
- Joined discussion
- Shared post

Each event should show:

- action type
- post title if available
- tags/topics
- energy earned
- timestamp

H. Demo Mode Controls

Only visible in demo mode.

Actions:

- Read article
- Upvote
- Bookmark
- Comment
- Share
- Complete quest
- Use power-up

Persona presets:

- Copaster Mode
- Code Monkey Mode
- Scholar Mode
- Philosopher Mode

Default demo persona: Code Monkey.

---

6.3 Settings /settings

Purpose: daily.dev connection and demo fallback.

Should include:

Connected Mode

- Input for daily.dev Personal Access Token.
- Save token server-side encrypted.
- Test connection.
- Fetch profile/feed/bookmarks.
- Show connection status.

Actions

- Disconnect daily.dev
- Delete token
- Switch to Demo Mode
- Reset Demo State

Security copy

Your daily.dev token is encrypted and only used server-side. Devine never exposes it to the browser.

---

6.4 Share Page /share/[snapshotId]

Public static share URL.

Purpose: hackathon-friendly shareable output.

Shows only privacy-safe snapshot data:

- Pet visual
- Seniority level
- Seniority score
- Health state
- Top 1–3 tags/topics
- Witty speech bubble
- Generated date/week
- Powered by daily.dev

Must not show:

- email
- API token
- raw activity events
- comments written by user
- private identifiers
- full article list unless explicitly chosen later

Example:

Devine Snapshot

The Grounded Scholar
Seniority Score: 67 / 100
Health: Stable

Top Signals:
architecture · ai · security

"My duck stopped saying 'it works on my machine' this week."

Powered by daily.dev

Image export is a bonus, not MVP-critical.

---

7. daily.dev Integration

7.1 Primary Mode

Use user-provided daily.dev Personal Access Token as the primary connected mode.

Reason: daily.dev Public API uses Bearer tokens and provides personalized data tied to the token owner.

7.2 Server-Wide Token

Use a server-wide token only for:

- fallback
- demo mode
- non-personal content fetching, if useful

Do not rely on server-wide token for personal user behavior.

7.3 Demo Mode

Required fallback.

Use when:

- user has no token
- token fails
- API rate limit occurs
- API does not expose required behavioral data

Demo mode should still feel interactive and complete.

---

8. API Feasibility

Based on daily.dev Public API docs:

Likely feasible:

- personalized feed
- popular/trending posts
- post details
- comments/discussions per post
- bookmarks
- search posts
- search tags
- profile
- tech stack
- custom feeds
- feed filters

Needs verification through OpenAPI:

- read history
- personal upvote history
- personal comment history
- share detection

Likely tracked inside Devine:

- read confirmation
- share event
- upvote confirmation if API does not expose it
- comment confirmation if API cannot identify user comments

---

9. Hybrid Tracking Model

Devine uses a hybrid model:

From daily.dev API

- feed posts
- post metadata
- tags/topics
- bookmarks
- profile
- tech stack
- post comments/discussions where available

Tracked inside Devine

- opening a post from Devine
- marking a post as read
- sharing via Devine
- “I upvoted this” confirmation
- “I joined the discussion” confirmation
- demo simulation events

Use trust user + light friction for MVP.

Anti-farming microcopy:

Devine rewards intentional learning signals. Don’t farm your duck; educate it.

---

10. Activity Energy Formula

Daily Energy Target

Daily Energy Target = 50

Energy Per Action

┌─────────────────────────────┬────────┬───────────┐
│ Action │ Energy │ Daily Cap │
├─────────────────────────────┼────────┼───────────┤
│ Read article │ +10 │ 5/day │
├─────────────────────────────┼────────┼───────────┤
│ Upvote │ +3 │ 10/day │
├─────────────────────────────┼────────┼───────────┤
│ Bookmark │ +5 │ 5/day │
├─────────────────────────────┼────────┼───────────┤
│ Comment / joined discussion │ +15 │ 3/day │
├─────────────────────────────┼────────┼───────────┤
│ Share │ +12 │ 3/day │
└─────────────────────────────┴────────┴───────────┘

Maximum possible daily energy:

read: 50
upvote: 30
bookmark: 25
comment: 45
share: 36
total: 186

But only 50 is needed to meet the daily target.

Design implication:

- Reading alone can keep the duck healthy.
- Reading alone should not make the duck a Tech Philosopher.
- Higher seniority requires curation, discussion, sharing, and topic variety.

---

11. Health System

Health is an internal numeric value:

health: 0–100

Health changes daily based on energy.

Health Daily Formula

┌──────────────┬───────────────┐
│ Energy Today │ Health Change │
├──────────────┼───────────────┤
│ >= 50 │ +5 │
├──────────────┼───────────────┤
│ 30–49 │ +0 │
├──────────────┼───────────────┤
│ 10–29 │ -8 │
├──────────────┼───────────────┤
│ 1–9 │ -12 │
├──────────────┼───────────────┤
│ 0 │ -20 │
└──────────────┴───────────────┘

Clamp:

health = min(100, max(0, health))

Missed Days

For MVP, no background cron is required.

When user opens dashboard:

1. Check last processed date.
2. Calculate missed days.
3. For each missed day, estimate/fetch activity if available.
4. Apply health decay based on energy for that day.
5. Save new snapshot.

---

12. Health Visual States

┌────────┬─────────────┬──────────────────────────────────┐
│ Health │ State │ Visual Direction │
├────────┼─────────────┼──────────────────────────────────┤
│ 80–100 │ Thriving │ glow, confident, active │
├────────┼─────────────┼──────────────────────────────────┤
│ 60–79 │ Stable │ normal idle animation │
├────────┼─────────────┼──────────────────────────────────┤
│ 40–59 │ Tired │ slightly weak, self-aware speech │
├────────┼─────────────┼──────────────────────────────────┤
│ 20–39 │ Sick │ sweat, panic, shake │
├────────┼─────────────┼──────────────────────────────────┤
│ 10–19 │ Critical │ glitch, warning UI │
├────────┼─────────────┼──────────────────────────────────┤
│ 0–9 │ Hibernating │ melted/suspended duck │
└────────┴─────────────┴──────────────────────────────────┘

Hibernating message:

Fatal Exception: Brain Activity Not Found. Process Suspended.

Important:
Hibernating is the lowest state, not permanent death.

---

13. Seniority System

Seniority is displayed to the user.
Health remains internal/systemic.

Seniority is based on a rolling 7-day quality score.

Seniority Score = 0–100

Seniority Levels

┌────────┬─────────────────────────────────────────┐
│ Score │ Level │
├────────┼─────────────────────────────────────────┤
│ 0–24 │ Si Dungu / The Ignorant Copaster │
├────────┼─────────────────────────────────────────┤
│ 25–49 │ Si Pekerja Mekanis / The Code Monkey │
├────────┼─────────────────────────────────────────┤
│ 50–79 │ Sang Intelektual / The Grounded Scholar │
├────────┼─────────────────────────────────────────┤
│ 80–100 │ Sang Filsuf / The Tech Philosopher │
└────────┴─────────────────────────────────────────┘

Level 1: The Ignorant Copaster

Represents isolation from community and low-quality learning.

Visual:

- duck with horse blinders
- trapped in shallow well
- confused
- bumps into screen

Behavior:

- hallucinated nonsense
- spaghetti-code energy
- “It works on my machine”

Philosophy:

- echo chamber
- ignorance
- disconnected from community curation

---

Level 2: The Code Monkey

Represents passive consumption and mechanical work.

Visual:

- factory uniform
- hammer/wrench
- repetitive machine-like behavior

Behavior:

- can answer basic technical questions
- rigid, tool-focused, no architectural perspective

Philosophy:

- reads but does not reflect
- consumes but does not curate
- uses tools without deeper understanding

---

Level 3: The Grounded Scholar

Represents active curation and grounded technical understanding.

Visual:

- reading glasses
- mini library
- thick book

Behavior:

- analytical
- understands tags, bookmarks, topic patterns
- gives architectural reasoning
- separates tools from design principles

Philosophy:

- finds signal in noise
- knowledge grounded in community validation

---

Level 4: The Tech Philosopher

Represents reflective, mature, community-aware technology thinking.

Visual:

- levitating duck
- golden aura
- “The Thinker” pose
- minimal UI around it

Behavior:

- speaks technically and philosophically
- frames technology in relation to human agency
- sees beyond code into systems and society

Philosophy:

- technology should empower, not trap
- developers shape the future collectively

---

14. Seniority Score Formula

Rolling window:

last 7 days

Components:

┌─────────────────────┬────────────┐
│ Component │ Max Points │
├─────────────────────┼────────────┤
│ Reading Consistency │ 30 │
├─────────────────────┼────────────┤
│ Topic Variety │ 15 │
├─────────────────────┼────────────┤
│ Curation │ 20 │
├─────────────────────┼────────────┤
│ Discussion │ 20 │
├─────────────────────┼────────────┤
│ Social Contribution │ 10 │
├─────────────────────┼────────────┤
│ Deep Tech Signals │ 5 │
├─────────────────────┼────────────┤
│ Total │ 100 │
└─────────────────────┴────────────┘

14.1 Reading Consistency

Target:

5 active reading days / 7

Formula:

min(activeReadingDays / 5, 1) \* 30

14.2 Topic Variety

Target:

5 unique tags/topics / 7 days

Formula:

min(uniqueTags / 5, 1) \* 15

14.3 Curation

Target:

5 bookmarks + 10 upvotes / 7 days

Formula:

bookmarkScore = min(bookmarks / 5, 1) _ 10
upvoteScore = min(upvotes / 10, 1) _ 10
curation = bookmarkScore + upvoteScore

14.4 Discussion

Target:

3 comments or joined discussions / 7 days

Formula:

min(comments / 3, 1) \* 20

14.5 Social Contribution

Target:

3 shares / 7 days

Formula:

min(shares / 3, 1) \* 10

14.6 Deep Tech Signals

Target:

3 deep-tag interactions / 7 days

Formula:

min(deepInteractions / 3, 1) \* 5

---

15. Deep Tech Tags

MVP allowlist:

- architecture
- system-design
- distributed-systems
- security
- ai
- machine-learning
- devops
- cloud
- database
- performance
- observability

Optional:

- webdev, only if metadata/content suggests a deep-dive rather than basic content.

Normalize tags:

- lowercase
- spaces to hyphen
- alias mapping:
  - ml → machine-learning
  - system design → system-design
  - cybersecurity → security
  - sre → observability or devops

---

16. Quest System

Quests guide behavior and give power-ups.

Use:

- generic daily quests
- one personalized quest
- one weekly quest

  16.1 Daily Quests

Feed the Duck

Requirement:

Read 3 articles

Reward:

Snack

Future-You Bookmark

Requirement:

Bookmark 1 post

Reward:

Knowledge Gem

Touch Grass, But Online

Requirement:

Comment or join 1 discussion

Reward:

Medicine

---

16.2 Personalized Quests

Pick based on weakest seniority component.

If Discussion is low

Name:

Join the Conversation

Requirement:

Comment or join 1 discussion

Reward:

Social Boost

If Topic Variety is low

Name:

Escape the Echo Chamber

Requirement:

Read 1 post outside your top tags

Reward:

Knowledge Gem

If Curation is low

Name:

Curate, Don’t Consume

Requirement:

Upvote 2 posts or bookmark 1 post

Reward:

Snack

If Social Contribution is low

Name:

Ship the Link

Requirement:

Share 1 post

Reward:

Social Boost

---

16.3 Weekly Quest

Five-Day Learning Streak

Requirement:

Active reading on 5 of 7 days

Reward:

Revive Feather

---

17. Power-Up System

Power-ups go into inventory.
User manually chooses when to use them.

Power-ups affect only:

- Energy
- Health

Power-ups do not affect:

- Seniority Score
- Learning profile
- Activity history

Power-Up Effects

┌────────────────┬───────────────────────────────────────┬─────────────────────────────┐
│ Power-Up │ Effect │ Use Case │
├────────────────┼───────────────────────────────────────┼─────────────────────────────┤
│ Snack │ +15 energy today │ reach daily target │
├────────────────┼───────────────────────────────────────┼─────────────────────────────┤
│ Medicine │ +12 health │ recover from Sick/Critical │
├────────────────┼───────────────────────────────────────┼─────────────────────────────┤
│ Knowledge Gem │ next read gives 2x energy │ encourage another article │
├────────────────┼───────────────────────────────────────┼─────────────────────────────┤
│ Social Boost │ next comment or share gives 2x energy │ encourage active engagement │
├────────────────┼───────────────────────────────────────┼─────────────────────────────┤
│ Revive Feather │ if health 0–9, set health to 25 │ recover from Hibernating │
└────────────────┴───────────────────────────────────────┴─────────────────────────────┘

Rules:

- inventory stores count
- using power-up decrements count
- power-up effects should be visible immediately
- active multiplier applies to next matching event only

---

18. Demo Mode

Demo mode is required.

Default Demo Persona

The Code Monkey

Default state:

Level: Si Pekerja Mekanis / The Code Monkey
Health: 62
Energy Today: 18 / 50
Speech: "I can set up NGINX, but please don't ask me why this architecture exists."

Demo Personas

Copaster Mode

- low/no activity
- low health
- seniority 0–24
- chaotic speech

Code Monkey Mode

- reads only
- passive engagement
- medium health
- seniority 25–49

Scholar Mode

- reads + bookmarks + upvotes
- good topic variety
- seniority 50–79

Philosopher Mode

- reads + comments + shares
- deep topics
- high variety
- seniority 80–100

Demo Simulation Buttons

- Read article
- Upvote
- Bookmark
- Comment
- Share
- Complete quest
- Use power-up

---

19. Visual Design

Overall UI

Style:

- elegant dark developer UI
- glass/card layout
- modern typography
- minimal noise
- yellow rubber duck accent
- green daily.dev-inspired accent

Pet Visual

Use manually created SVG/React components.

Component:

<DuckAvatar
    seniorityLevel="code_monkey"
    healthState="stable"
  />

Props:

- seniorityLevel
- healthState
- optional isPoweringUp
- optional isDemoMode

Pet Variants

Required SVG variants:

1. Ignorant Copaster
2. Code Monkey
3. Grounded Scholar
4. Tech Philosopher
5. Hibernating/Critical

Micro-Animations

Use motion and/or CSS.

Animations:

- idle bobbing
- glow for high state
- shake for sick/critical
- glitch for critical
- melt/suspended for hibernating
- sparkle after power-up
- pulse on energy gain

---

20. Tech Stack

Approved stack:

- Next.js
- TypeScript
- Tailwind CSS
- motion
- Drizzle ORM
- Neon Postgres
- Vercel

Auth/integration:

- BetterAuth if OAuth becomes available
- user-provided daily.dev Personal Access Token for MVP
- server-side encrypted token storage

---

21. Data Model

users

Stores app user.

Fields:

id
displayName
dailyDevHandle
dailyDevProfileId
selectedPet
mode: connected | demo
createdAt
updatedAt

daily_dev_connections

Stores encrypted daily.dev token.

Fields:

id
userId
encryptedToken
tokenLabel
tokenExpiresAt nullable
lastValidatedAt
createdAt
updatedAt

Never expose this token to the client.

activity_events

Stores raw activity events.

Fields:

id
userId
type: read | upvote | bookmark | comment | share
source: dailydev_api | devine_tracking | demo
dailyDevPostId nullable
postTitle nullable
postUrl nullable
tags json
energyEarned
occurredAt
metadata json
createdAt

daily_pet_snapshots

Stores daily calculated state.

Fields:

id
userId
date
energyEarned
health
healthState
seniorityScore
seniorityLevel
scoreBreakdown json
completedQuests json
powerUpsEarned json
createdAt
updatedAt

power_up_inventory

Fields:

id
userId
type: snack | medicine | knowledge_gem | social_boost | revive_feather
quantity
createdAt
updatedAt

active_power_up_effects

Fields:

id
userId
type: knowledge_gem | social_boost
appliesToAction
multiplier
expiresAt nullable
createdAt

quests

Could be static config in code for MVP.

If stored:

id
userId
questKey
type: daily | personalized | weekly
status: active | completed | claimed
progress
target
rewardPowerUp
dateScope
createdAt
updatedAt

share_snapshots

Public static share card.

Fields:

id
publicId
userId
dailyPetSnapshotId
seniorityLevel
seniorityScore
healthState
topTags json
speechBubble
generatedAt
createdAt

---

22. Core Calculation Flow

On Dashboard Open

1. Load user.
2. Check connection mode.
3. If connected:
   - decrypt daily.dev token server-side
   - fetch feed/profile/bookmarks as needed
   - sync available data

4. If token fails:
   - show fallback/demo prompt

5. Load Devine-tracked events.
6. Calculate missed days since last snapshot.
7. Apply health updates for missed days.
8. Calculate today’s energy.
9. Calculate rolling 7-day seniority score.
10. Generate quests.
11. Generate speech bubble.
12. Render dashboard.

---

23. Speech Bubble System

Use hybrid template + grounded context.

Inputs

- seniority level
- health state
- recent activity
- top tags
- weakest seniority component
- recent bookmarks

MVP Approach

Do not require full AI chat.

Use templates with dynamic inserts.

Examples:

Ignorant Copaster

"It works on my machine. Therefore, architecture is optional."

"I have achieved enlightenment: copy, paste, deploy, panic."

Code Monkey

"I can wire the API, but I still don't know why the system exists."

"You read three posts and questioned zero assumptions. Very factory-core."

Grounded Scholar

"Your bookmarks around {tag1} and {tag2} suggest you're starting to separate tools from architecture."

"Finally, a thought that survived contact with the documentation."

Tech Philosopher

"A stack is not a belief system. Choose tools that expand human agency."

"You are no longer reading posts. You are negotiating with the future of software."

Stretch Goal

Ask My Duck

- AI chat using daily.dev context
- grounded in bookmarks/tags/posts
- tone changes by seniority level

Not required for MVP.

---

24. Privacy & Security

Token Handling

- Store daily.dev Personal Access Token encrypted server-side.
- Never store in localStorage.
- Never expose token to client components.
- Use token only in server routes/actions.
- Provide disconnect/delete option.

Public Share Pages

Only expose aggregate non-sensitive data.

Do not expose:

- raw events
- token
- email
- private user IDs
- full personal comments
- embarrassing detailed inactivity history

Demo Mode

Do not require real token.

---

25. Hackathon Demo Golden Path

60-second demo:

1. Landing page:
   - Devine — Define your stack, develop your mind.

2. Connect daily.dev:
   - paste Personal Access Token or use demo mode.

3. Dashboard opens:
   - default Code Monkey state.

4. Show duck:
   - speech bubble jokes about shallow technical understanding.

5. Simulate or fetch activity:
   - read
   - bookmark
   - upvote
   - comment
   - share

6. Energy rises:
   - progress bar animates
   - health stabilizes

7. Seniority breakdown:
   - show reading, curation, discussion, topic variety

8. Personalized quest:
   - “Join the Conversation”

9. Complete quest:
   - earn Social Boost or Medicine

10. Duck evolves:

- Grounded Scholar state
- speech bubble becomes more analytical

11. Generate public share snapshot:

- /share/[snapshotId]

---

26. MVP Build Priorities

Priority 1: Core Shell

- Next.js app
- Tailwind layout
- landing page
- dashboard page
- settings page
- share page route

Priority 2: Scoring Engine

- energy calculation
- daily caps
- health calculation
- seniority score
- health states
- seniority levels

Priority 3: Demo Mode

- default Code Monkey state
- persona presets
- simulation buttons
- quest completion
- power-up inventory

Priority 4: Database

- Drizzle schema
- Neon connection
- users
- activity events
- snapshots
- inventory
- share snapshots

Priority 5: daily.dev Integration

- token input
- encrypted token storage
- server-side API client
- fetch profile/feed/bookmarks
- map posts/tags into activity model

Priority 6: Visual Pet

- SVG React component
- 4 seniority variants
- hibernating variant
- micro-animations

Priority 7: Share Snapshot

- create snapshot
- public URL
- privacy-safe render

Priority 8: Polish

- speech bubble templates
- next best action
- onboarding cards
- responsive UI
- error states

---

27. Non-Goals for MVP

Do not build yet:

- full AI chat
- leaderboard
- browser extension
- real-time webhook system
- background cron worker
- image export/PNG generation
- complex anti-cheat
- advanced OAuth unless daily.dev clearly supports it
- full article reading analytics
- public social graph

---

28. MVP Success Criteria

The MVP is successful if a judge can:

1. Understand Devine from the landing page in under 10 seconds.
2. Connect daily.dev or use demo mode.
3. See a rubber duck with health, energy, and seniority.
4. Trigger daily.dev-style actions and watch energy change.
5. Understand why seniority changes from the breakdown.
6. Complete a quest and earn/use a power-up.
7. See the duck personality change by level.
8. Generate a public share snapshot.
9. Understand how daily.dev data powers the habit loop.

---

29. Final Product Positioning

Devine is a developer habit companion powered by daily.dev.

It turns reading, bookmarking, upvoting, sharing, and discussion into a playful evolution system for a rubber duck that reflects how meaningfully you
learn.

You do not just feed the duck.

You define your stack.
You develop your mind.
