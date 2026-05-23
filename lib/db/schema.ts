import { index, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull().unique(),
  displayUsername: text("display_username").notNull(),
  email: text("email").unique(),
  passwordHash: text("password_hash").notNull(),
  passwordUpdatedAt: timestamp("password_updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  role: text("role").notNull().default("user"),
  tokenVersion: integer("token_version").notNull().default(1),
  timezone: text("timezone").notNull().default("UTC"),
  dailyDevHandle: text("daily_dev_handle"),
  dailyDevProfileId: text("daily_dev_profile_id"),
  selectedPet: text("selected_pet").notNull().default("rubber_duck"),
  mode: text("mode").notNull().default("demo"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    tokenVersion: integer("token_version").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("sessions_user_id_idx").on(table.userId)],
);

export const auditEvents = pgTable(
  "audit_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorUserId: uuid("actor_user_id").references(() => users.id),
    targetUserId: uuid("target_user_id").references(() => users.id),
    type: text("type").notNull(),
    metadata: jsonb("metadata").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("audit_events_actor_user_id_idx").on(table.actorUserId)],
);

export const dailyDevConnections = pgTable("daily_dev_connections", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  encryptedToken: jsonb("encrypted_token").notNull(),
  tokenLabel: text("token_label"),
  tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),
  lastValidatedAt: timestamp("last_validated_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const shareSnapshots = pgTable("share_snapshots", {
  id: uuid("id").primaryKey().defaultRandom(),
  publicId: text("public_id").notNull().unique(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  dailyPetSnapshotId: uuid("daily_pet_snapshot_id"),
  seniorityLevel: text("seniority_level").notNull(),
  seniorityScore: integer("seniority_score").notNull(),
  healthState: text("health_state").notNull(),
  topTags: jsonb("top_tags").$type<string[]>().notNull(),
  speechBubble: text("speech_bubble").notNull(),
  generatedAt: timestamp("generated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
