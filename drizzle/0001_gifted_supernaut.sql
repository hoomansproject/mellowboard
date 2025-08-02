ALTER TABLE "logs" DROP CONSTRAINT "logs_user_id_task_date_unique";--> statement-breakpoint
ALTER TABLE "logs" ADD CONSTRAINT "logs_user_id_task_date_type_unique" UNIQUE("user_id","task_date","type");