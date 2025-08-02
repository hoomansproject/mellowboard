import { type sheets_v4 } from "googleapis";
import * as schema from "../db/schema";
import { db } from "@/server/db";
import { logs } from "../db/schema";
import { eq, sql, and, desc, inArray, isNotNull } from "drizzle-orm";
import {
  calculateCronPoints,
  calculateMeetingPoints,
  calculateSeedPoints,
  extractDescription,
  getStatusFromTextAndColor,
} from "./points";
import { Color, getStatusColor } from "./color";
import type { InferInsertModel } from "drizzle-orm";
import type { LogType } from "../db/enums/log";

export type NewLog = InferInsertModel<typeof logs>;

/**
 * Normalize a username: trim, lowercase, then capitalize each word.
 */
export function normalizeName(raw: string): string {
  const t = raw.trim().toLowerCase();
  return t.replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Deduplicate an array of name entries by normalized name,
 * preserving the first occurrence's index.
 */
export function dedupeNames(
  inputs: { index: number; name: string }[],
): { index: number; name: string }[] {
  const seen = new Map<string, { index: number; name: string }>();
  for (const u of inputs) {
    const normalized = normalizeName(u.name);
    if (!seen.has(normalized)) {
      seen.set(normalized, { index: u.index, name: normalized });
    }
  }
  return Array.from(seen.values());
}

export function buildNameUsernameMap(
  names: { index: number; name: string }[],
  usernames: { index: number; name: string }[],
): Map<string, string> {
  const map = new Map<number, string>();
  // Map index → username
  usernames.forEach((u) => {
    map.set(u.index, u.name.trim());
  });

  const result = new Map<string, string>();
  names.forEach((n) => {
    const username = map.get(n.index);
    if (username != null) {
      result.set(normalizeName(n.name), username);
    }
  });

  return result;
}

export function parseUsernames(
  row: sheets_v4.Schema$RowData[],
  orientation: "row" | "column",
  orientationIndex: number,
): { index: number; name: string }[] {
  if (orientation === "row")
    return (row[orientationIndex]?.values ?? [])
      .map((v, idx) => {
        const name = v.formattedValue;
        return typeof name === "string" && name.trim() !== ""
          ? { index: idx, name: normalizeName(name) }
          : null;
      })
      .filter((v): v is { index: number; name: string } => v !== null);

  return row
    .map((r, idx) => ({
      index: idx,
      name: r.values?.[orientationIndex]?.formattedValue,
    }))
    .filter(
      (v): v is { index: number; name: string } =>
        typeof v.name === "string" && v.name.trim() !== "",
    )
    .map((v) => ({
      index: v.index,
      name: normalizeName(v.name),
    }));
}
export function parseDates(
  row: sheets_v4.Schema$RowData[],
  orientation: "row" | "column",
  orientationIndex: number,
): { index: number; date: string }[] {
  if (orientation === "column")
    return row
      .map((r, idx) => ({
        index: idx,
        date: r.values?.[orientationIndex]?.formattedValue,
      }))
      .filter(
        (v): v is { index: number; date: string } =>
          typeof v.date === "string" &&
          v.date.trim() !== "" &&
          new Date(v.date).setHours(0, 0, 0, 0) <
            new Date().setHours(0, 0, 0, 0),
      );

  return (row[orientationIndex]?.values ?? [])
    .map((v, idx) => {
      const date = v.formattedValue;
      return typeof date === "string" && date.trim() !== ""
        ? { index: idx, date: date }
        : null;
    })
    .filter(
      (v): v is { index: number; date: string } =>
        v !== null && new Date(v.date).getTime() < Date.now(),
    );
}

export async function getOrInsertUserIds(
  usernamesArg: { index: number; name: string }[],
  usernameMap?: Map<string, string>,
): Promise<Map<string, string>> {
  const usernames = dedupeNames(usernamesArg);

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
      const insertData = {
        name: u.name,
        freezeCardCount: 0,
        ...(usernameMap?.get(u.name)
          ? { github: usernameMap.get(u.name) }
          : {}),
      };

      const [inserted] = await db
        .insert(schema.users)
        .values(insertData)
        .returning({ id: schema.users.id });

      if (inserted?.id) {
        userIds.set(u.name, inserted.id);
      }
    }
  }
  return userIds;
}
export async function getUserStreak(
  userId: string,
  limit?: number,
): Promise<number> {
  const query = db
    .select({
      taskDate: logs.taskDate,
      createdAt: logs.createdAt,
    })
    .from(logs)
    .where(
      and(
        eq(logs.type, "task"),
        eq(logs.userId, userId),
        inArray(logs.status, ["worked", "freeze_card", "no_task"]),
        isNotNull(logs.taskDate),
      ),
    )
    .orderBy(desc(logs.taskDate));

  const userLogs = limit !== undefined ? await query.limit(limit) : await query;

  let streak = 0;
  let expectedDate: Date | null = null;

  for (const log of userLogs) {
    if (!log.taskDate || !log.createdAt) continue;

    const taskDate = new Date(log.taskDate);
    const createdAt = new Date(log.createdAt);

    const deadline = new Date(taskDate);
    deadline.setDate(deadline.getDate() + 1);
    deadline.setHours(23, 59, 59, 999); // Set to end of this day

    // If log was completed after deadline, break the streak
    if (createdAt > deadline) {
      // console.log(
      //   `Log for ${taskDate.toDateString()} was completed after deadline on ${createdAt.toDateString()}. Streak broken.`,
      // );
      break;
    }

    if (expectedDate) {
      const prevExpected = new Date(expectedDate);
      prevExpected.setDate(prevExpected.getDate() - 1);

      // If this taskDate is not one day before expectedDate, break
      if (taskDate.toDateString() !== prevExpected.toDateString()) {
        // console.log(
        //   `Streak broken at ${taskDate.toDateString()}, expected was ${prevExpected.toDateString()}`,
        // );
        break;
      }
    }

    streak++;
    expectedDate = taskDate;
  }

  return streak;
}

export function generateLogs(
  rowData: sheets_v4.Schema$RowData[],
  usernames: { index: number; name: string }[],
  dates: { index: number; date: string }[],
  userIds: Map<string, string>,
  type: LogType,
): NewLog[] {
  const logsToInsert: NewLog[] = [];

  if (type === "task")
    for (const d of dates) {
      for (const u of usernames) {
        const cell = rowData[d.index]?.values?.[u.index];
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
          status: getStatusFromTextAndColor(value, colorName),
          points: calculateSeedPoints(value, colorName),
          description: extractDescription(value),
          taskDate: new Date(d.date),
        });
      }
    }
  if (type === "meeting") {
    for (const d of dates) {
      for (const u of usernames) {
        const cell = rowData[u.index]?.values?.[d.index];
        const value = cell?.formattedValue ?? "";
        const userId = userIds.get(u.name);

        if (!userId) continue;
        if (value.trim() === "") continue;

        const status = getStatusFromTextAndColor(
          value,
          Color.Transparent,
          "meeting",
        );
        logsToInsert.push({
          userId,
          type: "meeting",
          status: status,
          points: calculateMeetingPoints(status),
          taskDate: new Date(d.date),
        });
      }
    }
  }
  return logsToInsert;
}

export async function generateCronLogs(
  rowData: sheets_v4.Schema$RowData[],
  usernames: { index: number; name: string }[],
  dates: { index: number; date: string }[],
  userIds: Map<string, string>,
  type: LogType,
): Promise<NewLog[]> {
  const logsToInsert: NewLog[] = [];

  if (type === "task") {
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
      const isToday = currentDate.toDateString() === today.toDateString();
      if (currentDate > cutoff) continue; // skip future or today

      for (const u of usernames) {
        const userId = userIds.get(u.name);
        if (!userId) continue;

        const lastLogDate = lastLogDates.get(userId);
        if (lastLogDate && currentDate <= lastLogDate) continue; // skip if already logged

        const cell = rowData[d.index]?.values?.[u.index];
        const value = cell?.formattedValue ?? "";
        const color = cell?.effectiveFormat?.backgroundColor ?? {};

        const colorName = getStatusColor({
          red: color.red ?? 0,
          green: color.green ?? 0,
          blue: color.blue ?? 0,
        });

        if (
          (colorName === Color.Transparent || colorName === Color.Unknown) &&
          value.trim() === ""
        )
          continue;

        const alreadyInserted = logsToInsert.some(
          (log) =>
            log.userId === userId &&
            log.type === "task" &&
            log.taskDate != null &&
            log.taskDate < currentDate,
        );

        logsToInsert.push({
          userId,
          type: "task",
          status: getStatusFromTextAndColor(value, colorName),
          points: await calculateCronPoints(
            userId,
            value,
            colorName,
            isToday,
            alreadyInserted,
          ),
          description: extractDescription(value),
          taskDate: currentDate,
        });
      }
    }
  }

  if (type === "meeting") {
    for (const d of dates) {
      for (const u of usernames) {
        const cell = rowData[u.index]?.values?.[d.index];
        const value = cell?.formattedValue ?? "";
        const userId = userIds.get(u.name);

        if (!userId) continue;
        if (value.trim() === "") continue;

        const status = getStatusFromTextAndColor(
          value,
          Color.Transparent,
          "meeting",
        );
        logsToInsert.push({
          userId,
          type: "meeting",
          status: status,
          description: null, // No description for cron meeting logs
          points: calculateMeetingPoints(status),
          taskDate: new Date(d.date),
        });
      }
    }
  }

  return logsToInsert;
}

export async function updateLogs(pendingLogs: NewLog[]): Promise<number> {
  let count = 0;

  await db.transaction(async (tx) => {
    const userMap = new Map<string, number>();

    // Step 1: Insert logs and accumulate points only if insertion succeeds
    for (const log of pendingLogs) {
      const inserted = await tx
        .insert(logs)
        .values(log)
        .onConflictDoNothing({
          target: [logs.userId, logs.taskDate, logs.type],
        })
        .returning({ id: logs.id });

      if (!inserted?.[0]?.id) {
        // Log the failed insertion attempt
        console.log("Failed to insert log:", log);
        continue;
      }

      count += 1;

      // Accumulate points for user if inserted
      userMap.set(log.userId, (userMap.get(log.userId) ?? 0) + log.points);
    }

    // Step 2: Update totalPoints and freezeCardCount for users who had logs inserted
    for (const [userId, newPoints] of userMap) {
      const result = await tx
        .select({ totalPoints: schema.users.totalPoints })
        .from(schema.users)
        .where(eq(schema.users.id, userId));

      const prevPoints = result[0]?.totalPoints ?? 0;
      const newTotal = prevPoints + newPoints;

      const prevThresholds = Math.floor(prevPoints / 50);
      const newThresholds = Math.floor(newTotal / 50);
      const thresholdsCrossed = Math.max(0, newThresholds - prevThresholds);

      await tx
        .update(schema.users)
        .set({
          totalPoints: newTotal,
          freezeCardCount: sql`${schema.users.freezeCardCount} + ${thresholdsCrossed}`,
        })
        .where(eq(schema.users.id, userId));
    }

    // Step 3: Update streaks for users who had logs inserted
    for (const userId of userMap.keys()) {
      const streak = await getUserStreak(userId);
      await tx
        .update(schema.users)
        .set({ streak })
        .where(eq(schema.users.id, userId));
    }
  });

  return count;
}
