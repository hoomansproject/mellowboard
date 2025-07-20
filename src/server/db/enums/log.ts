import { pgEnum } from "drizzle-orm/pg-core";

export const logTypes = ["meeting", "task"] as const;
export const logStatuses = [
  "worked",
  "not_available",
  "no_task",
  "freeze_card",
] as const;

// Drizzle enums
export const logTypePg = pgEnum("log_type", logTypes);
export const logStatusPg = pgEnum("log_status", logStatuses);

// TS Types
export type LogType = (typeof logTypes)[number];
export type LogStatus = (typeof logStatuses)[number];
