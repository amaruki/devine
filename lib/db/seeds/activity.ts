export const activityTypes = ["read", "upvote", "bookmark", "comment", "share"] as const;

export const tags = [
  "javascript",
  "typescript",
  "react",
  "rust",
  "python",
  "devops",
  "ai",
  "css",
  "go",
  "database",
];

export const energyValues: Record<string, number> = {
  read: 10,
  upvote: 3,
  bookmark: 5,
  comment: 15,
  share: 12,
};
