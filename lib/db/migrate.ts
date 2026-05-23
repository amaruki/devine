import { migrate } from "drizzle-orm/postgres-js/migrator";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { db, sql } from "./client";

const currentDir = dirname(fileURLToPath(import.meta.url));

await migrate(db, { migrationsFolder: join(currentDir, "migrations") });
await sql.end();
