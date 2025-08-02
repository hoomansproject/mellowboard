DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'log_type') THEN
    CREATE TYPE log_type AS ENUM ('meeting', 'task');
  END IF;
END$$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'log_status') THEN
    CREATE TYPE log_status AS ENUM ('worked', 'not_available', 'no_task', 'freeze_card');
  END IF;
END$$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cron_status_type') THEN
	CREATE TYPE cron_status_type AS ENUM ('running', 'success', 'failed');
  END IF;
END$$;

CREATE TABLE "cron_status" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" "cron_status_type" NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"time_taken" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "logs" (
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
CREATE TABLE "users" (
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
ALTER TABLE "logs" ADD CONSTRAINT "logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;