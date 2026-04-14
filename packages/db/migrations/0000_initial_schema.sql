CREATE TABLE "daily_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"log_date" date NOT NULL,
	"mood_rating" integer NOT NULL,
	"anxiety_level" integer NOT NULL,
	"stress_level" integer NOT NULL,
	"sleep_hours" numeric(4, 1) NOT NULL,
	"sleep_quality" integer NOT NULL,
	"sleep_disturbances" text DEFAULT '[]' NOT NULL,
	"activity_type" text DEFAULT 'none' NOT NULL,
	"activity_minutes" integer DEFAULT 0 NOT NULL,
	"social_interactions" integer NOT NULL,
	"depression_symptoms" text DEFAULT '[]' NOT NULL,
	"anxiety_symptoms" text DEFAULT '[]' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"google_id" text,
	"has_seen_onboarding" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_google_id_unique" UNIQUE("google_id")
);
--> statement-breakpoint
ALTER TABLE "daily_logs" ADD CONSTRAINT "daily_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "daily_logs_user_date_idx" ON "daily_logs" USING btree ("user_id","log_date");