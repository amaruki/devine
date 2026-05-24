import { eq } from "drizzle-orm";
import { db, sql } from "./client";
import { activityEvents, dailyPetSnapshots, users } from "./schema";
import { activityTypes, energyValues, tags } from "./seeds/activity";
import { adminSeed, personas, qaUserSeed } from "./seeds/personas";

const seed = process.argv[2];

if (seed !== "dev" && seed !== "qa") {
  throw new Error("Seed must be dev or qa");
}

const DEMO_PASSWORD = "demo1234";

function makeEvent(
  userId: string,
  type: (typeof activityTypes)[number],
  index: number,
): typeof activityEvents.$inferInsert {
  const dayOffset = Math.floor(index / 5);
  const date = new Date();
  date.setDate(date.getDate() - dayOffset);
  date.setHours(9 + (index % 8), (index * 7) % 60);

  const tag = tags[(index * 3) % tags.length];

  return {
    userId,
    type,
    source: "demo",
    postTitle: `Demo Post ${index + 1}: ${tag} tips`,
    postUrl: `https://dev.to/demo/${tag}-tips-${index}`,
    tags: [tag, tags[(index * 3 + 1) % tags.length]],
    energyEarned: energyValues[type],
    occurredAt: date,
  };
}

function makeSnapshot(
  userId: string,
  s: {
    daysAgo: number;
    health: number;
    healthState: string;
    seniorityScore: number;
    seniorityLevel: string;
  },
): typeof dailyPetSnapshots.$inferInsert {
  const date = new Date();
  date.setDate(date.getDate() - s.daysAgo);
  return {
    userId,
    date: date.toISOString().split("T")[0],
    energyEarned: Math.floor(Math.random() * 60) + 10,
    health: s.health,
    healthState: s.healthState,
    seniorityScore: s.seniorityScore,
    seniorityLevel: s.seniorityLevel,
    scoreBreakdown: {
      readingConsistency: Math.floor(Math.random() * 30),
      topicVariety: Math.floor(Math.random() * 20),
      curation: Math.floor(Math.random() * 15),
      discussion: Math.floor(Math.random() * 10),
      socialContribution: Math.floor(Math.random() * 10),
      deepTechSignals: Math.floor(Math.random() * 15),
    },
    completedQuests: [],
    powerUpsEarned: [],
  };
}

async function ensureUser(
  username: string,
  displayUsername: string,
  role: string,
  mode: string,
  passwordHash: string,
): Promise<string> {
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (existing.length > 0) {
    return existing[0].id;
  }

  const inserted = await db
    .insert(users)
    .values({ username, displayUsername, passwordHash, mode, role })
    .returning({ id: users.id });

  console.log(`  Created user: ${username} / ${DEMO_PASSWORD}`);
  return inserted[0].id;
}

async function seedDev(): Promise<void> {
  console.log("Seeding dev...");
  const passwordHash = await Bun.password.hash(DEMO_PASSWORD, "argon2id");

  await ensureUser(
    adminSeed.username,
    adminSeed.displayUsername,
    adminSeed.role,
    adminSeed.mode,
    passwordHash,
  );

  const personaEntries = Object.entries(personas);

  for (const [name, seedData] of personaEntries) {
    const userId = await ensureUser(
      seedData.user.username,
      seedData.user.displayUsername,
      seedData.user.role,
      seedData.user.mode,
      passwordHash,
    );

    const hasActivity = await db
      .select({ id: activityEvents.id })
      .from(activityEvents)
      .where(eq(activityEvents.userId, userId))
      .limit(1);

    if (hasActivity.length === 0) {
      const events: (typeof activityEvents.$inferInsert)[] = [];
      for (let j = 0; j < seedData.activityCount; j++) {
        const type = activityTypes[j % activityTypes.length];
        events.push(makeEvent(userId, type, j));
      }
      for (const event of events) {
        await db.insert(activityEvents).values(event);
      }
      console.log(`  Inserted ${seedData.activityCount} events for ${name}`);
    }

    const hasSnapshot = await db
      .select({ id: dailyPetSnapshots.id })
      .from(dailyPetSnapshots)
      .where(eq(dailyPetSnapshots.userId, userId))
      .limit(1);

    if (hasSnapshot.length === 0) {
      const snapshots = seedData.snapshots.map((s) => makeSnapshot(userId, s));
      for (const snap of snapshots) {
        await db.insert(dailyPetSnapshots).values(snap);
      }
      console.log(`  Inserted ${snapshots.length} snapshots for ${name}`);
    }
  }
}

async function seedQa(): Promise<void> {
  console.log("Seeding qa...");
  const passwordHash = await Bun.password.hash(DEMO_PASSWORD, "argon2id");

  await ensureUser(
    qaUserSeed.username,
    qaUserSeed.displayUsername,
    qaUserSeed.role,
    qaUserSeed.mode,
    passwordHash,
  );
}

async function main(): Promise<void> {
  try {
    if (seed === "dev") {
      await seedDev();
    } else {
      await seedQa();
    }
    console.log("Seed complete.");
  } finally {
    await sql.end();
  }
}

await main();
