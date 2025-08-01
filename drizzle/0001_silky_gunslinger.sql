ALTER TABLE "mellowboard_logs" ADD COLUMN "description" varchar(500);--> statement-breakpoint
ALTER TABLE "mellowboard_users" ADD COLUMN "total_points" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "mellowboard_users" ADD COLUMN "streak" integer DEFAULT 0 NOT NULL;