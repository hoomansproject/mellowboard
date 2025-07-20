import { type sheets_v4 } from "googleapis";
import * as schema from "../db/schema";
import { db } from "@/server/db";
import { logs } from "../db/schema";
import { eq, sql } from "drizzle-orm";
import { calculateSeedPoints, getSeedStatusFromTextAndColor } from "./points";
import { Color, getStatusColor } from "./color";
import type { InferInsertModel } from "drizzle-orm";

export type NewLog = InferInsertModel<typeof logs>;

export function parseUsernames(
  row: sheets_v4.Schema$RowData[],
): { colIndex: number; name: string }[] {
  return (row[1]?.values ?? [])
    .map((v, idx) => {
      const name = v.formattedValue;
      return typeof name === "string" && name.trim() !== ""
        ? { colIndex: idx, name }
        : null;
    })
    .filter((v): v is { colIndex: number; name: string } => v !== null);
}
export function parseDates(
  row: sheets_v4.Schema$RowData[],
): { rowIndex: number; date: string }[] {
  return row
    .map((r, idx) => ({
      rowIndex: idx,
      date: r.values?.[0]?.formattedValue,
    }))
    .filter(
      (v): v is { rowIndex: number; date: string } =>
        typeof v.date === "string" &&
        v.date.trim() !== "" &&
        new Date(v.date).getTime() <= Date.now(),
    );
}

export async function getOrInsertUserIds(
  usernames: { colIndex: number; name: string }[],
): Promise<Map<string, string>> {
  const userIds = new Map<string, string>();

  for (const u of usernames) {
    const [existing] = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.name, u.name))
      .limit(1);

    if (existing?.id) {
      userIds.set(u.name, existing.id);
    } else {
      const [inserted] = await db
        .insert(schema.users)
        .values({ name: u.name, freezeCardCount: 0 })
        .returning({ id: schema.users.id });

      if (inserted?.id) {
        userIds.set(u.name, inserted.id);
      }
    }
  }
  return userIds;
}

export function generateLogs(
  rowData: sheets_v4.Schema$RowData[],
  usernames: { colIndex: number; name: string }[],
  dates: { rowIndex: number; date: string }[],
  userIds: Map<string, string>,
): NewLog[] {
  const logsToInsert: NewLog[] = [];

  for (const d of dates) {
    for (const u of usernames) {
      const cell = rowData[d.rowIndex]?.values?.[u.colIndex];
      const value = cell?.formattedValue ?? "";
      const color = cell?.effectiveFormat?.backgroundColor ?? {};

      const colorName = getStatusColor({
        red: color.red ?? 0,
        green: color.green ?? 0,
        blue: color.blue ?? 0,
      });

      const userId = userIds.get(u.name);

      if (!userId) continue;
      if (colorName === Color.Transparent && value.trim() === "") continue;

      logsToInsert.push({
        userId,
        type: "task",
        status: getSeedStatusFromTextAndColor(value, colorName),
        points: calculateSeedPoints(value, colorName),
        taskDate: new Date(d.date),
      });
    }
  }

  return logsToInsert;
}

export async function generateCronLogs(
  rowData: sheets_v4.Schema$RowData[],
  usernames: { colIndex: number; name: string }[],
  dates: { rowIndex: number; date: string }[],
  userIds: Map<string, string>,
): Promise<NewLog[]> {
  const logsToInsert: NewLog[] = [];

  // ✅ Get last taskDate for each user directly here
  const lastLogs = await db
    .select({
      userId: logs.userId,
      lastDate: sql<Date>`MAX(${logs.taskDate})`.as("lastDate"),
    })
    .from(logs)
    .groupBy(logs.userId);

  const lastLogDates = new Map(
    lastLogs.map((entry) => [entry.userId, entry.lastDate]),
  );

  // ✅ Define cutoff date as yesterday 23:59:59
  const today = new Date();
  const cutoff = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - 1,
    23,
    59,
    59,
  );

  for (const d of dates) {
    const currentDate = new Date(d.date);
    if (currentDate > cutoff) continue; // skip future or today

    for (const u of usernames) {
      const userId = userIds.get(u.name);
      if (!userId) continue;

      const lastLogDate = lastLogDates.get(userId);
      if (lastLogDate && currentDate <= lastLogDate) continue; // skip if already logged

      const cell = rowData[d.rowIndex]?.values?.[u.colIndex];
      const value = cell?.formattedValue ?? "";
      const color = cell?.effectiveFormat?.backgroundColor ?? {};

      const colorName = getStatusColor({
        red: color.red ?? 0,
        green: color.green ?? 0,
        blue: color.blue ?? 0,
      });

      if (colorName === Color.Transparent && value.trim() === "") continue;

      logsToInsert.push({
        userId,
        type: "task",
        status: getSeedStatusFromTextAndColor(value, colorName),
        points: calculateSeedPoints(value, colorName),
        taskDate: currentDate,
      });
    }
  }

  return logsToInsert;
}

export async function updateLogs(pendingLogs: NewLog[]) {
  await db.transaction(async (tx) => {
    for (const log of pendingLogs) {
      await tx.insert(logs).values(log);

      const result = await tx
        .select({ sum: sql<number>`SUM(points)` })
        .from(logs)
        .where(eq(logs.userId, log.userId));

      const sumPoints = result[0]?.sum ?? 0;

      await tx
        .update(schema.users)
        .set({
          freezeCardCount: sql`${schema.users.freezeCardCount} + ((${sumPoints} % 50 + ${log.points}) / 50)::int`,
        })
        .where(eq(schema.users.id, log.userId));
    }
  });
}
