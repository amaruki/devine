import type { SeniorityLevel } from "@/features/scoring";
import { DEEP_TECH_TAGS, normalizeTag } from "./tags";

export type ScoreBreakdown = {
  readingConsistency: number;
  topicVariety: number;
  curation: number;
  discussion: number;
  socialContribution: number;
  deepTechSignals: number;
};

export type SeniorityResult = {
  score: number;
  level: SeniorityLevel;
  breakdown: ScoreBreakdown;
};

export function calculateSeniorityScore(
  events: { type: string; tags: string[]; occurredAt: Date }[],
  daysInWindow: number = 7,
): SeniorityResult {
  const now = new Date();
  const cutoff = new Date(now.getTime() - daysInWindow * 24 * 60 * 60 * 1000);
  const recent = events.filter((e) => e.occurredAt >= cutoff);

  const breakdown = computeBreakdown(recent, daysInWindow);
  const score = Math.round(
    breakdown.readingConsistency +
      breakdown.topicVariety +
      breakdown.curation +
      breakdown.discussion +
      breakdown.socialContribution +
      breakdown.deepTechSignals,
  );
  const level = scoreToLevel(score);

  return { score, level, breakdown };
}

function computeBreakdown(
  events: { type: string; tags: string[]; occurredAt: Date }[],
  daysInWindow: number,
): ScoreBreakdown {
  const daySet = new Set<string>();
  const uniqueTags = new Set<string>();
  let bookmarks = 0;
  let upvotes = 0;
  let comments = 0;
  let shares = 0;
  let deepTechCount = 0;

  for (const event of events) {
    if (event.type === "read") {
      daySet.add(event.occurredAt.toISOString().slice(0, 10));
    }
    if (event.type === "bookmark") bookmarks++;
    if (event.type === "upvote") upvotes++;
    if (event.type === "comment") comments++;
    if (event.type === "share") shares++;

    for (const tag of event.tags) {
      const normalized = normalizeTag(tag);
      uniqueTags.add(normalized);
      if (DEEP_TECH_TAGS.has(normalized)) {
        deepTechCount++;
      }
    }
  }

  const readingConsistency = Math.round((daySet.size / daysInWindow) * 30);
  const topicVariety = Math.round(Math.min(uniqueTags.size / 8, 1) * 15);
  const curation = Math.round(Math.min((bookmarks + upvotes) / 10, 1) * 20);
  const discussion = Math.round(Math.min(comments / 3, 1) * 20);
  const socialContribution = Math.round(Math.min(shares / 3, 1) * 10);
  const deepTechSignals = Math.round(Math.min(deepTechCount / 5, 1) * 5);

  return {
    readingConsistency,
    topicVariety,
    curation,
    discussion,
    socialContribution,
    deepTechSignals,
  };
}

export function scoreToLevel(score: number): SeniorityLevel {
  if (score >= 80) return "tech_philosopher";
  if (score >= 50) return "grounded_scholar";
  if (score >= 25) return "code_monkey";
  return "ignorant_copaster";
}
