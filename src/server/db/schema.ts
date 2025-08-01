// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import { index, pgTableCreator, unique } from "drizzle-orm/pg-core";

import { uuid, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { logTypePg, logStatusPg } from "./enums/log";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `mellowboard_${name}`);

export const posts = createTable(
  "post",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 256 }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("name_idx").on(t.name)],
);

//mellowboard tables

// ✅ users table
export const users = createTable("users", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).unique().notNull(),
  github: varchar("github", { length: 100 }).unique(),
  freezeCardCount: integer("freeze_card_count").notNull().default(0),
  totalPoints: integer("total_points").notNull().default(0),
  streak: integer("streak").notNull().default(0),
});

// ✅ logs table
export const logs = createTable(
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
  (table) => [unique().on(table.userId, table.taskDate)],
);

// ✅ cron_status table
export const cronStatus = createTable("cron_status", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  status: varchar("status", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
});
