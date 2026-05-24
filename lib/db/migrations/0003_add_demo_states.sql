CREATE TABLE "demo_states" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users" ("id"),
  "persona" text DEFAULT 'code_monkey' NOT NULL,
  "state" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "reset_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "demo_states_user_id_unique" UNIQUE ("user_id")
);

CREATE INDEX "demo_states_user_id_idx" ON "demo_states" ("user_id");
