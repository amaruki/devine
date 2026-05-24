import type { ActivityType } from "@/features/activity";
import type { HealthState, SeniorityLevel } from "@/features/scoring";

export type DemoPersonaKey = "copaster" | "code_monkey" | "scholar" | "philosopher";

export type DemoPersona = {
  key: DemoPersonaKey;
  label: string;
  description: string;
  initialHealth: number;
  initialHealthState: HealthState;
  initialSeniorityScore: number;
  initialSeniorityLevel: SeniorityLevel;
};

export const DEMO_PERSONAS: Record<DemoPersonaKey, DemoPersona> = {
  copaster: {
    key: "copaster",
    label: "Ignorant Copaster",
    description: "Fresh developer who copies code from Stack Overflow. Starting their journey.",
    initialHealth: 40,
    initialHealthState: "tired",
    initialSeniorityScore: 10,
    initialSeniorityLevel: "ignorant_copaster",
  },
  code_monkey: {
    key: "code_monkey",
    label: "Code Monkey",
    description: "Productive developer who writes code daily. Making steady progress.",
    initialHealth: 72,
    initialHealthState: "thriving",
    initialSeniorityScore: 30,
    initialSeniorityLevel: "code_monkey",
  },
  scholar: {
    key: "scholar",
    label: "Grounded Scholar",
    description: "Deep reader who understands multiple paradigms. Building expertise.",
    initialHealth: 80,
    initialHealthState: "thriving",
    initialSeniorityScore: 68,
    initialSeniorityLevel: "grounded_scholar",
  },
  philosopher: {
    key: "philosopher",
    label: "Tech Philosopher",
    description: "Senior architect who sees the big picture. Wisdom incarnate.",
    initialHealth: 90,
    initialHealthState: "thriving",
    initialSeniorityScore: 90,
    initialSeniorityLevel: "tech_philosopher",
  },
};

export const DEFAULT_PERSONA: DemoPersonaKey = "code_monkey";

export function isValidPersona(value: string): value is DemoPersonaKey {
  return value in DEMO_PERSONAS;
}

export function getDemoPersona(key: DemoPersonaKey): DemoPersona {
  return DEMO_PERSONAS[key];
}

export const DEMO_ACTION_POSTS: Record<ActivityType, { title: string; tags: string[] }> = {
  read: { title: "Scaling Postgres Queues", tags: ["database", "performance"] },
  upvote: { title: "Why Rust is the Future of Systems Programming", tags: ["rust", "systems"] },
  bookmark: {
    title: "A Deep Dive into Distributed Consensus",
    tags: ["distributed-systems", "architecture"],
  },
  comment: { title: "The State of WebAssembly in 2026", tags: ["webassembly", "frontend"] },
  share: { title: "Building Resilient Microservices", tags: ["microservices", "devops"] },
};
