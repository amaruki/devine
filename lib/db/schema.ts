import {
  date,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

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

export const activityEvents = pgTable(
  "activity_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    type: text("type").notNull(),
    source: text("source").notNull(),
    idempotencyKey: text("idempotency_key"),
    dailydevEventId: text("dailydev_event_id"),
    dailyDevPostId: text("daily_dev_post_id"),
    postTitle: text("post_title"),
    postUrl: text("post_url"),
    tags: jsonb("tags").notNull().default([]),
    energyEarned: integer("energy_earned").notNull().default(0),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    metadata: jsonb("metadata").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("activity_events_user_id_idx").on(table.userId),
    uniqueIndex("activity_events_user_id_idempotency_key_idx").on(
      table.userId,
      table.idempotencyKey,
    ),
    uniqueIndex("activity_events_user_id_dailydev_event_id_idx").on(
      table.userId,
      table.dailydevEventId,
    ),
  ],
);

export const dailyPetSnapshots = pgTable(
  "daily_pet_snapshots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    date: date("date").notNull(),
    energyEarned: integer("energy_earned").notNull().default(0),
    health: integer("health").notNull().default(62),
    healthState: text("health_state").notNull(),
    seniorityScore: integer("seniority_score").notNull().default(0),
    seniorityLevel: text("seniority_level").notNull(),
    scoreBreakdown: jsonb("score_breakdown").notNull().default({}),
    completedQuests: jsonb("completed_quests").notNull().default([]),
    powerUpsEarned: jsonb("power_ups_earned").notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("daily_pet_snapshots_user_id_date_idx").on(table.userId, table.date),
    index("daily_pet_snapshots_user_id_idx").on(table.userId),
  ],
);

export const shareSnapshots = pgTable("share_snapshots", {
  id: uuid("id").primaryKey().defaultRandom(),
  publicId: text("public_id").notNull().unique(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  dailyPetSnapshotId: uuid("daily_pet_snapshot_id").references(() => dailyPetSnapshots.id),
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
