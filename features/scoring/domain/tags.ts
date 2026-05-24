const TAG_ALIASES: Record<string, string> = {
  ml: "machine-learning",
  "system design": "system-design",
  cybersecurity: "security",
  sre: "devops",
};

export const DEEP_TECH_TAGS = new Set([
  "architecture",
  "system-design",
  "distributed-systems",
  "security",
  "ai",
  "machine-learning",
  "devops",
  "cloud",
  "database",
  "performance",
  "observability",
]);

export function normalizeTag(tag: string): string {
  const lower = tag.trim().toLowerCase().replace(/\s+/g, "-");
  return TAG_ALIASES[lower] ?? lower;
}
