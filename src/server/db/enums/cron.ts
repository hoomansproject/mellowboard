import { pgEnum } from "drizzle-orm/pg-core";

export const cronStatuses = ["running", "success", "failed"] as const;
// Drizzle enums
export const cronStatusPg = pgEnum("cron_status_type", cronStatuses);
// TS Types
export type CronStatus = (typeof cronStatuses)[number];
