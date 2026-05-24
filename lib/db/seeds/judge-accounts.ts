import { eq } from "drizzle-orm";
import { db, sql } from "../client";
import { auditEvents, demoStates, users } from "../schema";
import { personas } from "./personas";
import type { DemoPersonaKey } from "@/features/demo";

export type JudgeDemoAccount = {
  username: string;
  persona: DemoPersonaKey;
  seededAt: string;
};

export type JudgeSeedResult = {
  status: "ok";
  accounts: JudgeDemoAccount[];
};

export async function seedJudgeDemoAccounts(): Promise<JudgeSeedResult> {
  const seededAt = new Date().toISOString();
  const accounts: JudgeDemoAccount[] = [];

  for (const [personaKey] of Object.entries(personas)) {
    const persona = personaKey as DemoPersonaKey;
    const seedData = personas[persona];

    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, seedData.user.username))
      .limit(1);

    if (existing.length === 0) {
      console.log(`  Skipping ${seedData.user.username}: user not found (run dev seed first)`);
      continue;
    }

    const userId = existing[0].id;

    await db
      .insert(demoStates)
      .values({ userId, persona, state: { path: "judge" } })
      .onConflictDoUpdate({
        target: demoStates.userId,
        set: {
          persona,
          state: { path: "judge" },
          updatedAt: new Date(),
        },
      });

    await db.insert(auditEvents).values({
      actorUserId: null,
      targetUserId: userId,
      type: "judge_account_seed",
      metadata: { persona, username: seedData.user.username },
    });

    accounts.push({
      username: seedData.user.username,
      persona,
      seededAt,
    });
  }

  console.log(`Seeded ${accounts.length} judge demo accounts`);
  return { status: "ok", accounts };
}

async function main(): Promise<void> {
  try {
    console.log("Seeding judge demo accounts...");
    const result = await seedJudgeDemoAccounts();
    console.log(`Judge seed complete: ${result.accounts.length} accounts`);
  } finally {
    await sql.end();
  }
}

await main();
