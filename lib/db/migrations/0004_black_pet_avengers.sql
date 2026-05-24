CREATE TABLE "active_power_up_effects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"applies_to_action" text NOT NULL,
	"multiplier" integer DEFAULT 2 NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activity_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"source" text NOT NULL,
	"idempotency_key" text,
	"dailydev_event_id" text,
	"daily_dev_post_id" text,
	"post_title" text,
	"post_url" text,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"energy_earned" integer DEFAULT 0 NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_user_id" uuid,
	"target_user_id" uuid,
	"type" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_dev_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"encrypted_token" jsonb NOT NULL,
	"token_label" text,
	"token_expires_at" timestamp with time zone,
	"last_validated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_pet_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"date" date NOT NULL,
	"energy_earned" integer DEFAULT 0 NOT NULL,
	"health" integer DEFAULT 62 NOT NULL,
	"health_state" text NOT NULL,
	"seniority_score" integer DEFAULT 0 NOT NULL,
	"seniority_level" text NOT NULL,
	"score_breakdown" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"completed_quests" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"power_ups_earned" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "demo_states" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"persona" text DEFAULT 'code_monkey' NOT NULL,
	"state" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"reset_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "demo_states_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "power_up_inventory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"quest_key" text NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"target" integer NOT NULL,
	"reward_power_up" text NOT NULL,
	"date_scope" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_version" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"last_seen_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "share_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"public_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"daily_pet_snapshot_id" uuid,
	"seniority_level" text NOT NULL,
	"seniority_score" integer NOT NULL,
	"health_state" text NOT NULL,
	"top_tags" jsonb NOT NULL,
	"speech_bubble" text NOT NULL,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "share_snapshots_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"display_username" text NOT NULL,
	"email" text,
	"password_hash" text NOT NULL,
	"password_updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"token_version" integer DEFAULT 1 NOT NULL,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"daily_dev_handle" text,
	"daily_dev_profile_id" text,
	"selected_pet" text DEFAULT 'rubber_duck' NOT NULL,
	"mode" text DEFAULT 'demo' NOT NULL,
	"persona" text DEFAULT 'code_monkey' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "active_power_up_effects" ADD CONSTRAINT "active_power_up_effects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_target_user_id_users_id_fk" FOREIGN KEY ("target_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_dev_connections" ADD CONSTRAINT "daily_dev_connections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_pet_snapshots" ADD CONSTRAINT "daily_pet_snapshots_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demo_states" ADD CONSTRAINT "demo_states_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "power_up_inventory" ADD CONSTRAINT "power_up_inventory_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quests" ADD CONSTRAINT "quests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_snapshots" ADD CONSTRAINT "share_snapshots_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_snapshots" ADD CONSTRAINT "share_snapshots_daily_pet_snapshot_id_daily_pet_snapshots_id_fk" FOREIGN KEY ("daily_pet_snapshot_id") REFERENCES "public"."daily_pet_snapshots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "active_power_up_effects_user_id_idx" ON "active_power_up_effects" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "activity_events_user_id_idx" ON "activity_events" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "activity_events_user_id_idempotency_key_idx" ON "activity_events" USING btree ("user_id","idempotency_key");--> statement-breakpoint
CREATE UNIQUE INDEX "activity_events_user_id_dailydev_event_id_idx" ON "activity_events" USING btree ("user_id","dailydev_event_id");--> statement-breakpoint
CREATE INDEX "audit_events_actor_user_id_idx" ON "audit_events" USING btree ("actor_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "daily_pet_snapshots_user_id_date_idx" ON "daily_pet_snapshots" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "daily_pet_snapshots_user_id_idx" ON "daily_pet_snapshots" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "demo_states_user_id_idx" ON "demo_states" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "power_up_inventory_user_id_idx" ON "power_up_inventory" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "power_up_inventory_user_id_type_idx" ON "power_up_inventory" USING btree ("user_id","type");--> statement-breakpoint
CREATE INDEX "quests_user_id_idx" ON "quests" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "quests_user_id_quest_key_date_scope_idx" ON "quests" USING btree ("user_id","quest_key","date_scope");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");