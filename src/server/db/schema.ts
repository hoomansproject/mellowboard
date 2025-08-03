// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
  uuid,
  varchar,
  integer,
  timestamp,
  unique,
  pgTable,
  boolean,
} from "drizzle-orm/pg-core";
import { logTypePg, logStatusPg } from "./enums/log";
import { cronStatusPg } from "./enums/cron";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */

//mellowboard tables

// ✅ users table
export const users = pgTable("users", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).unique().notNull(),
  github: varchar("github", { length: 100 }).unique(),
  freezeCardCount: integer("freeze_card_count").notNull().default(0),
  totalPoints: integer("total_points").notNull().default(0),
  streak: integer("streak").notNull().default(0),
  active: boolean("active").notNull().default(false),
});

// ✅ logs table
export const logs = pgTable(
  "logs",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    type: logTypePg("type").notNull(),
    status: logStatusPg("status").notNull(),
    points: integer("points").notNull(),
    description: varchar("description", { length: 500 }),
    taskDate: timestamp("task_date"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [unique().on(table.userId, table.taskDate, table.type)],
);

// ✅ cron_status table
export const cronStatus = pgTable("cron_status", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  status: cronStatusPg("status").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  timeTaken: integer("time_taken").notNull().default(0),
});
