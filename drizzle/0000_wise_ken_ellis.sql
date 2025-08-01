CREATE TABLE  IF NOT EXISTS "cron_status" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" varchar(100),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
-- drizzle/migrations/xxxx_create_log_enums.sql

CREATE TYPE IF NOT EXISTS log_type AS ENUM ('meeting', 'task');
CREATE TYPE IF NOT EXISTS log_status AS ENUM ('worked', 'not_available', 'no_task', 'freeze_card');
--> statement-breakpoint
CREATE TABLE  IF NOT EXISTS "logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "log_type" NOT NULL,
	"status" "log_status" NOT NULL,
	"points" integer NOT NULL,
	"description" varchar(500),
	"task_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "logs_user_id_task_date_unique" UNIQUE("user_id","task_date")
);

--> statement-breakpoint
CREATE TABLE  IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"github" varchar(100),
	"freeze_card_count" integer DEFAULT 0 NOT NULL,
	"total_points" integer DEFAULT 0 NOT NULL,
	"streak" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "users_name_unique" UNIQUE("name"),
	CONSTRAINT "users_github_unique" UNIQUE("github")
);
--> statement-breakpoint
ALTER TABLE "logs" ADD CONSTRAINT "logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint


