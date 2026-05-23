# Acceptance Criteria — Sprint 5

## User Stories in Scope

- **US-14** Create, view, and soft-delete public static share snapshots — Developer
- **US-21 if time allows** Recover account access using an optional email — Developer

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

## US-21 — Recover account access using an optional email (Developer)

### AC-21.01 — Recovery scope

```gherkin
Given the Developer is using Devine
When recovery scope
Then MVP may use superadmin-assisted account recovery when email reset is not implemented
```

### AC-21.02 — Future email recovery

```gherkin
Given the Developer is using Devine
When future email recovery
Then Post-MVP recovery uses optional email and reset-link flow
```

---
