import { type sheets_v4 } from "googleapis";
import * as schema from "../db/schema";
import { db } from "@/server/db";
import { logs, users } from "../db/schema";
import { eq, sql, and, desc, inArray, isNotNull } from "drizzle-orm";
import {
  calculateCronPoints,
  calculateMeetingPoints,
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

export function parseUsernames(
  row: sheets_v4.Schema$RowData[],
  orientation: "row" | "column",
  orientationIndex: number,
): Map<string, number> {
  if (orientation === "row") {
    const values = row[orientationIndex]?.values ?? [];
    return new Map(
      values
        .map((v, idx) => {
          const name = v.formattedValue;
          return typeof name === "string" && name.trim() !== ""
            ? ([normalizeName(name), idx] as [string, number])
            : null;
        })
        .filter((v): v is [string, number] => v !== null),
    );
  }

  return new Map(
    row
      .map((r, idx) => {
        const name = r.values?.[orientationIndex]?.formattedValue;
        return typeof name === "string" && name.trim() !== ""
          ? ([normalizeName(name), idx] as [string, number])
          : null;
      })
      .filter((v): v is [string, number] => v !== null),
  );
}
export function parseDates(
  row: sheets_v4.Schema$RowData[],
  orientation: "row" | "column",
  orientationIndex: number,
): Map<string, number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Remove time for comparison

  if (orientation === "column") {
    return new Map(
      row
        .map((r, idx) => {
          const date = r.values?.[orientationIndex]?.formattedValue;
          return typeof date === "string" &&
            date.trim() !== "" &&
            new Date(date).setHours(0, 0, 0, 0) < today.getTime()
            ? ([date, idx] as [string, number])
            : null;
        })
        .filter((v): v is [string, number] => v !== null),
    );
  }

  const values = row[orientationIndex]?.values ?? [];
  return new Map(
    values
      .map((v, idx) => {
        const date = v.formattedValue;
        return typeof date === "string" &&
          date.trim() !== "" &&
          new Date(date).setHours(0, 0, 0, 0) < today.getTime()
          ? ([date, idx] as [string, number])
          : null;
      })
      .filter((v): v is [string, number] => v !== null),
  );
}
function parseBooleanData(
  row: sheets_v4.Schema$RowData[],
  orientation: "row" | "column",
  orientationIndex: number,
): Map<number, boolean> {
  function toBool(val: unknown): boolean | null {
    if (typeof val === "boolean") return val;
    if (typeof val === "string") {
      const v = val.trim().toLowerCase();
      if (v === "true") return true;
      if (v === "false") return false;
    }
    return null;
  }

  if (orientation === "row") {
    const values = row[orientationIndex]?.values ?? [];
    return new Map(
      values
        .map((v, idx) => {
          const value = toBool(v.formattedValue);
          return value !== null ? ([idx, value] as [number, boolean]) : null;
        })
        .filter((v): v is [number, boolean] => v !== null),
    );
  }

  return new Map(
    row
      .map((r, idx) => {
        const value = toBool(r.values?.[orientationIndex]?.formattedValue);
        return value !== null ? ([idx, value] as [number, boolean]) : null;
      })
      .filter((v): v is [number, boolean] => v !== null),
  );
}

export function buildNameUsernameMap(
  GithubData: sheets_v4.Schema$RowData[],
): Map<string, { username: string; active: boolean }> {
  const githubNames = parseUsernames(GithubData, "column", 0);
  const githubUsernames = parseUsernames(GithubData, "column", 1);
  const userActive = parseBooleanData(GithubData, "column", 2);
  console.log(githubNames);
  console.log(githubUsernames);
  console.log(userActive);
  const indexToUsername = new Map<number, string>();

  // Invert usernames Map<string, number> to Map<number, string>
  for (const [username, index] of githubUsernames) {
    if (index === 0) continue; // Skip header row
    indexToUsername.set(index, username.trim());
  }

  const result = new Map<string, { username: string; active: boolean }>();

  // For each name, find matching index in indexToUsername
  for (const [name, index] of githubNames) {
    if (index === 0) continue; // Skip header row
    const username = indexToUsername.get(index);
    const active = userActive.get(index) ?? false; // Default to false if not found
    if (username != null) {
      result.set(normalizeName(name), { username, active });
    }
  }

  return result;
}
export async function getOrInsertUserIds(
  usernameMap: Map<string, { username: string; active: boolean }>,
): Promise<Map<string, string>> {
  const userIds = new Map<string, string>();

  for (const u of usernameMap.keys()) {
    const [existing] = await db
      .select({ id: schema.users.id, active: schema.users.active })
      .from(schema.users)
      .where(eq(schema.users.name, u))
      .limit(1);

    if (existing?.id) {
      if (existing.active !== usernameMap.get(u)?.active) {
        await db
          .update(schema.users)
          .set({ active: usernameMap.get(u)?.active })
          .where(eq(schema.users.id, existing.id));
      }
      userIds.set(u, existing.id);
    } else {
      const insertData = {
        name: u,
        freezeCardCount: 0,
        ...(usernameMap?.get(u)?.username
          ? { github: usernameMap.get(u)?.username }
          : {}),
        active: usernameMap.get(u)?.active ?? false,
      };

      const [inserted] = await db
        .insert(schema.users)
        .values(insertData)
        .returning({ id: schema.users.id });

      if (inserted?.id) {
        userIds.set(u, inserted.id);
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

export async function getUserDataMapByType(
  type: "task" | "meeting",
): Promise<
  | Map<string, { userId: string; lastDate: Date | null; streak: number }>
  | Date
  | undefined
> {
  if (type === "task") {
    const tempUserData = await db
      .select({
        userId: users.id,
        lastDate: sql<Date | null>`MAX(${logs.taskDate})`.as("lastDate"),
        streak: users.streak,
        name: users.name,
      })
      .from(users)
      .leftJoin(logs, and(eq(logs.userId, users.id), eq(logs.type, "task")))
      .groupBy(users.id, users.name, users.streak);

    const userData = new Map<
      string,
      { userId: string; lastDate: Date | null; streak: number }
    >();

    for (const entry of tempUserData) {
      userData.set(entry.name, {
        userId: entry.userId,
        lastDate: entry.lastDate, // will be null if no logs
        streak: entry.streak,
      });
    }

    return userData;
  }

  // type === "meeting"
  const tempUserData = await db
    .select({
      lastDate: sql<Date>`MAX(${logs.taskDate})`.as("lastDate"),
    })
    .from(logs)
    .where(eq(logs.type, "meeting"))
    .limit(1);

  return tempUserData[0]?.lastDate;
}

export async function generateCronLogs(
  rowData: sheets_v4.Schema$RowData[],
  usernames: Map<string, number>, // name -> index
  dates: Map<string, number>,
  userIds: Map<string, string>, // name -> userId (log table foreign key)
  type: LogType,
  userData:
    | Map<string, { userId: string; lastDate: Date | null; streak?: number }>
    | Date
    | undefined,
): Promise<NewLog[]> {
  const logsToInsert: NewLog[] = [];

  // CRON LOGS GENERATION DB READ (HAPPENS ONCE FOR TYPE "task" OR "meeting")

  if (type === "task") {
    // ✅ Get last taskDate for each user directly here
    const today = new Date();
    const cutoff = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 1,
      23,
      59,
      59,
    );

    // Sort dates ascending
    const sortedDates = Array.from(dates.entries())
      .map(([dateStr, index]) => ({ date: new Date(dateStr), dateStr, index }))
      .filter(({ date }) => date <= cutoff) // filter out future or today
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    for (const [username, uindex] of usernames) {
      if (!(userData instanceof Map)) continue;
      const user = userData.get(username);
      if (!user) continue;
      const lastDate = user?.lastDate ?? new Date(0); // fallback to epoch

      for (const { date, index: dindex } of sortedDates) {
        if (date <= lastDate) continue;

        const cell = rowData[dindex]?.values?.[uindex];
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
            log.userId === user.userId &&
            log.type === "task" &&
            log.taskDate != null &&
            log.taskDate < new Date(),
        );

        logsToInsert.push({
          userId: user.userId,
          type: "task",
          status: getStatusFromTextAndColor(value, colorName),
          points: await calculateCronPoints(
            value,
            colorName,
            user?.streak ?? 0,
            date.toDateString() === cutoff.toDateString(),
            alreadyInserted,
          ),
          description: extractDescription(value),
          taskDate: date,
        });
      }
    }
  }

  if (type === "meeting") {
    for (const [d, dindex] of dates) {
      if (userData instanceof Date && new Date(d) <= userData) continue;
      for (const [u, uindex] of usernames) {
        const cell = rowData[uindex]?.values?.[dindex];
        const value = cell?.formattedValue ?? "";

        const userId = userIds.get(u);

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
          taskDate: new Date(d),
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
  });

  return count;
}

export function checkNewLogsForStreak(logs: NewLog[]) {
  const streakMap = new Map<string, boolean>();

  for (const log of logs) {
    if (
      log.type === "task" &&
      (log.status === "worked" ||
        log.status === "freeze_card" ||
        log.status === "no_task") &&
      log.taskDate
    ) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const logDate = new Date(log.taskDate);
      logDate.setHours(0, 0, 0, 0);

      if (logDate.getTime() === yesterday.getTime()) {
        streakMap.set(log.userId, true);
      }
    }
  }

  return streakMap;
}
export async function updateStreak(
  taskUserData: Map<
    string,
    { userId: string; lastDate: Date | null; streak: number }
  >,
  taskLogsToInsert: NewLog[],
): Promise<void> {
  const streakMap = checkNewLogsForStreak(taskLogsToInsert);
  for (const [, { userId, streak }] of taskUserData.entries()) {
    await db
      .update(users)
      .set({ streak: streakMap.get(userId) ? (streak ?? 0) + 1 : 0 })
      .where(eq(users.id, userId));
  }
}
