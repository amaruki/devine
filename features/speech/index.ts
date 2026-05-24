import type { HealthState, SeniorityLevel } from "@/features/scoring";

export type SpeechContext = {
  healthState: HealthState;
  seniorityLevel: SeniorityLevel;
  topTags: string[];
  energyToday: number;
  dailyTarget: number;
};

export type AnimationCue = "idle" | "celebrate" | "tired" | "revive";

const HEALTH_SPEECH: Record<HealthState, string[]> = {
  thriving: [
    "Quack! You're on fire today. 🔥",
    "Feeling great! The rubber gods smile upon you.",
    "Peak duck performance. Keep reading, human.",
  ],
  stable: [
    "Smooth sailing. Just keep reading.",
    "All systems nominal. The duck is pleased.",
    "Steady as a rubber duck in a bathtub.",
  ],
  tired: [
    "Quack... getting a bit sluggish here.",
    "Could use more articles. I'm deflating.",
    "Yawn. Even rubber ducks need rest.",
  ],
  sick: [
    "Squeak... not feeling great.",
    "The rubber is cracking. Please read something.",
    "Send help. And articles. Mostly articles.",
  ],
  critical: [
    "Critical squeak... I'm barely floating.",
    "Rubber integrity at 20%. Read now!",
    "One more quiet day and I'm a bath toy.",
  ],
  hibernating: [
    "Zzz... squeak... zzz...",
    "Your duck has entered hibernation mode.",
    "No reading detected. Duck is preserving rubber integrity.",
  ],
};

const LEVEL_GREETING: Record<SeniorityLevel, string[]> = {
  ignorant_copaster: [
    "Ah, a fresh copaster! Everyone starts somewhere.",
    "Welcome to the flock, rookie. Read and grow.",
    "First day in the duck pond? Let's read.",
  ],
  code_monkey: [
    "Code Monkey detected. Branching out nicely.",
    "Keep typing, monkey. The duck watches.",
    "You're in the jungle now. Good progress.",
  ],
  grounded_scholar: [
    "A Scholar walks among us. Impressive depth.",
    "Wisdom accumulates. The duck is proud.",
    "Deep reading pays off. Scholarly quack!",
  ],
  tech_philosopher: [
    "Tech Philosopher in the building!",
    "You've transcended code. Pure wisdom.",
    "The duck bows to your intellectual prowess.",
  ],
};

const TAG_SPEECH: Record<string, string[]> = {
  rust: ["Rust? Someone likes it safe and fast.", "Borrow checker approves this reading."],
  typescript: [
    "Types all the way down, huh?",
    "TypeScript: because JavaScript needed adult supervision.",
  ],
  javascript: ["Still JavaScript-ing? Respect.", "The classic. JS never dies."],
  python: ["Python? Clean and readable. Good choice.", "Snake charmer detected."],
  go: ["Gopher vibes. Concurrent and proud.", "Go get 'em!"],
  database: ["Data doesn't lie. Neither does the duck.", "Index those queries, friend."],
  performance: ["Speed matters. This duck approves.", "Optimize all the things!"],
  ai: ["AI, eh? The duck sees the future.", "Machine learning duck noises: beep boop quack."],
  devops: ["Infrastructure as code, duck as rubber.", "Deploy the quack!"],
  security: [
    "Stay secure. The duck encrypts its squeaks.",
    "Security reading? You're a responsible dev.",
  ],
  architecture: [
    "Big picture thinker. The duck salutes.",
    "Architecture: where ducks draw boxes and arrows.",
  ],
  "distributed-systems": [
    "Distributed? This duck scales horizontally.",
    "CAP theorem? Consistency is for ducks.",
  ],
};

export function selectSpeechBubble(context: SpeechContext): string {
  const energyPct = context.dailyTarget > 0 ? context.energyToday / context.dailyTarget : 0;

  // Energy-based override (highest priority)
  if (energyPct >= 1) {
    return pickDeterministic(HEALTH_SPEECH.thriving, 0);
  }
  if (context.energyToday === 0 && context.healthState !== "hibernating") {
    return "No activity yet today. Let's read something!";
  }

  // Health-based priority
  if (context.healthState === "critical" || context.healthState === "hibernating") {
    return pickDeterministic(HEALTH_SPEECH[context.healthState], 0);
  }

  // Tag-based speech (30% chance if tags exist)
  if (context.topTags.length > 0) {
    const tag = context.topTags[0];
    const tagLines = TAG_SPEECH[tag];
    if (tagLines) {
      const hash = simpleHash(tag + context.healthState);
      return tagLines[hash % tagLines.length];
    }
  }

  // Level-based greeting (40% chance)
  const levelLines = LEVEL_GREETING[context.seniorityLevel];
  const levelHash = simpleHash(context.seniorityLevel + context.healthState);
  if (levelHash % 5 < 2) {
    return levelLines[levelHash % levelLines.length];
  }

  // Health-based fallback
  const healthLines = HEALTH_SPEECH[context.healthState];
  return pickDeterministic(healthLines, levelHash % healthLines.length);
}

export function getAnimationCue(context: SpeechContext): AnimationCue {
  const energyPct = context.dailyTarget > 0 ? context.energyToday / context.dailyTarget : 0;
  if (energyPct >= 1) return "celebrate";
  if (context.healthState === "critical" || context.healthState === "hibernating") return "revive";
  if (context.healthState === "tired" || context.healthState === "sick") return "tired";
  return "idle";
}

function pickDeterministic(lines: string[], index: number): string {
  return lines[index % lines.length];
}

function simpleHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) - hash + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}
