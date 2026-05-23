export type HealthState = "thriving" | "stable" | "tired" | "sick" | "critical" | "hibernating";
export type SeniorityLevel =
  | "ignorant_copaster"
  | "code_monkey"
  | "grounded_scholar"
  | "tech_philosopher";

export function normalizeTag(tag: string) {
  return tag.trim().toLowerCase();
}
