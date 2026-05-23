# 14. Share Snapshot Privacy Strategy

This document is the source of truth for public share snapshot generation and privacy boundaries. Cite this document instead of repeating allowed and denied public fields.

## 14.1 Decision matrix

| Concern           | Decision                                                                   | Rationale                                                   |
| ----------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Snapshot model    | Copy static aggregate fields into `share_snapshots`                        | Shared cards must not change unexpectedly.                  |
| Public identifier | URL-safe random `public_id`                                                | Avoids exposing internal UUIDs.                             |
| Public fields     | Seniority, score, health state, top tags, speech, generated date           | Expressive enough for sharing without leaking raw behavior. |
| Denied fields     | Token, email, user ID, profile ID, raw events, comments, full article list | Required by MVP privacy and PRD user stories.               |
| Rendering         | Public SSR route reads only public projection                              | Keeps private rows and user ownership out of page props.    |

## 14.2 Interface and request shape

```http
POST /api/share-snapshots
Content-Type: application/json

{}
```

Response:

```json
{
  "publicId": "devine_abc123",
  "url": "https://example.com/share/devine_abc123"
}
```

Public loader:

```ts
export type PublicShareSnapshot = {
  publicId: string;
  seniorityLevel: SeniorityLevel;
  seniorityScore: number;
  healthState: HealthState;
  topTags: string[];
  speechBubble: string;
  generatedAt: string;
};

export async function getPublicShareSnapshot(publicId: string): Promise<PublicShareSnapshot | null>;
```

## 14.3 Performance targets

| Target                    |                  Value | Source                                   |
| ------------------------- | ---------------------: | ---------------------------------------- |
| Share page load           |        1.5 seconds P95 | `08-non-functional-requirements.md §8.1` |
| Share creation rate limit | 20 per session per day | `08-non-functional-requirements.md §8.1` |
| Share snapshot volume     | 100 snapshots per user | `08-non-functional-requirements.md §8.1` |

## 14.4 Rate-limit and security constraints

1. Share creation requires the authenticated owner.
2. Share viewing requires no session.
3. The public route reads by `public_id` and returns only `PublicShareSnapshot`.
4. Speech bubble text must come from safe templates, not raw user comments.
5. Top tags must be normalized tags, not full article titles.

## 14.5 Component and contract

File layout:

```text
lib/share/
├─ createSnapshot.ts
├─ publicProjection.ts
├─ types.ts
└─ index.ts
app/share/[snapshotId]/page.tsx
app/api/share-snapshots/route.ts
```

Locked public exports:

```ts
export { createShareSnapshot, getPublicShareSnapshot } from "./publicProjection";
export type { PublicShareSnapshot } from "./types";
```

## 14.6 What this does not do

1. It does not generate PNG images. Image export is a bonus outside MVP.
2. It does not expose raw activity events. Activity history belongs only to the private dashboard.
3. It does not update after creation. A new state requires a new snapshot.
4. It does not include daily.dev private identifiers. daily.dev integration owns external profile metadata.

## 14.7 Cross-references

| Related concern  | Source                           |
| ---------------- | -------------------------------- |
| Share table      | `06-data-model.md §6.10`         |
| Security policy  | `07-security.md §7.5`            |
| Public route     | `05-module-definitions.md §5.11` |
| Success criteria | `../../mvp.md` section 28        |

## 14.8 Open follow-ups

1. Add image export only if the hackathon demo has time after core share URLs work.
2. Add user-selected article highlights only after explicit privacy controls exist.
3. Add snapshot expiry only if public permanence becomes a product concern.
