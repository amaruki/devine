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
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_pet_snapshots" ADD CONSTRAINT "daily_pet_snapshots_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_snapshots" ADD CONSTRAINT "share_snapshots_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_snapshots" ADD CONSTRAINT "share_snapshots_daily_pet_snapshot_id_daily_pet_snapshots_id_fk" FOREIGN KEY ("daily_pet_snapshot_id") REFERENCES "public"."daily_pet_snapshots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activity_events_user_id_idx" ON "activity_events" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "activity_events_user_id_idempotency_key_idx" ON "activity_events" USING btree ("user_id","idempotency_key");--> statement-breakpoint
CREATE UNIQUE INDEX "activity_events_user_id_dailydev_event_id_idx" ON "activity_events" USING btree ("user_id","dailydev_event_id");--> statement-breakpoint
CREATE UNIQUE INDEX "daily_pet_snapshots_user_id_date_idx" ON "daily_pet_snapshots" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "daily_pet_snapshots_user_id_idx" ON "daily_pet_snapshots" USING btree ("user_id");