export type SnapshotInput = {
  daysAgo: number;
  health: number;
  healthState: string;
  seniorityScore: number;
  seniorityLevel: string;
};

export type PersonaUser = {
  username: string;
  displayUsername: string;
  role: "user" | "superadmin";
  mode: "demo" | "connected";
};

export type PersonaSeed = {
  user: PersonaUser;
  activityCount: number;
  snapshots: SnapshotInput[];
};

const t = "thriving";
const s = "stable";
const td = "tired";

const ic = "ignorant_copaster";
const cm = "code_monkey";
const gs = "grounded_scholar";
const tp = "tech_philosopher";

export const personas: Record<string, PersonaSeed> = {
  copaster: {
    user: { username: "copaster", displayUsername: "copaster", role: "user", mode: "demo" },
    activityCount: 6,
    snapshots: [
      { daysAgo: 2, health: 30, healthState: td, seniorityScore: 5, seniorityLevel: ic },
      { daysAgo: 1, health: 35, healthState: td, seniorityScore: 8, seniorityLevel: ic },
      { daysAgo: 0, health: 40, healthState: td, seniorityScore: 10, seniorityLevel: ic },
    ],
  },
  code_monkey: {
    user: { username: "code_monkey", displayUsername: "code_monkey", role: "user", mode: "demo" },
    activityCount: 20,
    snapshots: [
      { daysAgo: 2, health: 65, healthState: s, seniorityScore: 20, seniorityLevel: cm },
      { daysAgo: 1, health: 70, healthState: t, seniorityScore: 28, seniorityLevel: cm },
      { daysAgo: 0, health: 72, healthState: t, seniorityScore: 30, seniorityLevel: cm },
    ],
  },
  scholar: {
    user: { username: "scholar", displayUsername: "scholar", role: "user", mode: "demo" },
    activityCount: 35,
    snapshots: [
      { daysAgo: 2, health: 75, healthState: t, seniorityScore: 55, seniorityLevel: gs },
      { daysAgo: 1, health: 78, healthState: t, seniorityScore: 62, seniorityLevel: gs },
      { daysAgo: 0, health: 80, healthState: t, seniorityScore: 68, seniorityLevel: gs },
    ],
  },
  philosopher: {
    user: { username: "philosopher", displayUsername: "philosopher", role: "user", mode: "demo" },
    activityCount: 50,
    snapshots: [
      { daysAgo: 2, health: 85, healthState: t, seniorityScore: 82, seniorityLevel: tp },
      { daysAgo: 1, health: 88, healthState: t, seniorityScore: 85, seniorityLevel: tp },
      { daysAgo: 0, health: 90, healthState: t, seniorityScore: 90, seniorityLevel: tp },
    ],
  },
};

export const adminSeed: PersonaUser = {
  username: "admin",
  displayUsername: "Admin",
  role: "superadmin",
  mode: "demo",
};

export const qaUserSeed: PersonaUser = {
  username: "test_user",
  displayUsername: "Test User",
  role: "user",
  mode: "demo",
};
