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

function parseDbUTCDatetime(str: string | Date): Date {
  if (str instanceof Date) return str;

  // Convert "2025-08-01 18:30:00" → "2025-08-01T18:30:00Z"
  const utcString = str.replace(" ", "T") + "Z";
  return new Date(utcString);
}

export function buildNameUsernameMap(
  GithubData: sheets_v4.Schema$RowData[],
): Map<string, { username: string; active: boolean }> {
  const githubNames = parseUsernames(GithubData, "column", 0);
  const githubUsernames = parseUsernames(GithubData, "column", 1);
  const userActive = parseBooleanData(GithubData, "column", 2);
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

async function batchUpdateUsersActive(
  updates: { id: string; active: boolean }[],
) {
  if (updates.length === 0) return;

  const cases = updates
    .map(({ id, active }) => `WHEN '${id}' THEN ${active ? "TRUE" : "FALSE"}`)
    .join(" ");

  const ids = updates.map(({ id }) => `'${id}'`).join(", ");

  const query = sql.raw(`
    UPDATE users
    SET active = CASE id
      ${cases}
    END
    WHERE id IN (${ids});
  `);

  return db.execute(query); // or `await` if you’re in an async context
}

export async function getOrInsertUserIds(
  usernameMap: Map<string, { username: string; active: boolean }>,
): Promise<Map<string, string>> {
  const names = Array.from(usernameMap.keys());

  // Step 1: Find existing users in batch
  const existingUsers = await db
    .select({
      id: schema.users.id,
      name: schema.users.name,
      active: schema.users.active,
    })
    .from(schema.users)
    .where(inArray(schema.users.name, names));

  const userIds = new Map<string, string>();
  const usersToInsert: (typeof schema.users.$inferInsert)[] = [];
  const usersToUpdate: { id: string; active: boolean }[] = [];

  const existingMap = new Map(existingUsers.map((u) => [u.name, u]));

  for (const name of names) {
    const info = usernameMap.get(name)!;
    const existing = existingMap.get(name);

    if (existing) {
      // Check if active status differs → schedule update
      if (existing.active !== info.active) {
        usersToUpdate.push({ id: existing.id, active: info.active });
      }
      userIds.set(name, existing.id);
    } else {
      // Prepare for batch insert
      usersToInsert.push({
        name,
        freezeCardCount: 0,
        github: info.username ?? null,
        active: info.active,
      });
    }
  }

  // Step 2: Batch insert missing users
  if (usersToInsert.length > 0) {
    const inserted = await db
      .insert(schema.users)
      .values(usersToInsert)
      .returning({ id: schema.users.id, name: schema.users.name });

    for (const u of inserted) {
      userIds.set(u.name, u.id);
    }
  }

  // Step 3 (optional): Batch update users with changed "active"
  // for (const { id, active } of usersToUpdate) {
  //   await db
  //     .update(schema.users)
  //     .set({ active })
  //     .where(eq(schema.users.id, id));
  // }

  if (usersToUpdate.length > 0) {
    await batchUpdateUsersActive(usersToUpdate);
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

export async function getUserDataMapByType(type: "task" | "meeting"): Promise<
  | Map<
      string,
      {
        userId: string;
        lastDate: Date | null;
        streak: number;
        totalPoints: number;
      }
    >
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
        totalPoints: users.totalPoints,
      })
      .from(users)
      .leftJoin(logs, and(eq(logs.userId, users.id), eq(logs.type, "task")))
      .groupBy(users.id, users.name, users.streak);

    const userData = new Map<
      string,
      {
        userId: string;
        lastDate: Date | null;
        streak: number;
        totalPoints: number;
      }
    >();

    for (const entry of tempUserData) {
      userData.set(entry.name, {
        userId: entry.userId,
        lastDate: entry.lastDate
          ? new Date(parseDbUTCDatetime(entry.lastDate))
          : null, // will be null if no logs
        streak: entry.streak,
        totalPoints: entry.totalPoints ?? 0,
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

  return tempUserData[0]?.lastDate
    ? new Date(parseDbUTCDatetime(tempUserData[0].lastDate))
    : undefined;
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

    // Create a Map<Date, { dateStr: string; index: number }> to maintain order without using a large array
    const sortedDatesMap = new Map<Date, { dateStr: string; index: number }>();
    Array.from(dates.entries())
      .map(([dateStr, index]) => {
        const date = new Date(dateStr);

        return { date, dateStr, index };
      })
      .filter(({ date }) => date <= cutoff) // Compare date-only
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .forEach(({ date, dateStr, index }) => {
        sortedDatesMap.set(date, { dateStr, index });
      });

    for (const [username, uindex] of usernames) {
      if (!(userData instanceof Map)) continue;
      const user = userData.get(username);
      if (!user) continue;
      const lastDate = user?.lastDate; // fallback to epoch

      for (const [date, { index: dindex }] of sortedDatesMap) {
        if (lastDate && date.getTime() <= lastDate.getTime()) continue;

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
    const sortedDatesMap = new Map<Date, { dateStr: string; index: number }>();
    Array.from(dates.entries())
      .map(([dateStr, index]) => {
        const date = new Date(dateStr);
        date.setHours(0, 0, 0, 0); // Strip time
        return { date, dateStr, index };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .forEach(({ date, dateStr, index }) => {
        sortedDatesMap.set(date, { dateStr, index });
      });

    for (const [d, { index: dindex }] of sortedDatesMap) {
      if (userData instanceof Date && d.getTime() <= userData.getTime())
        continue;
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
          taskDate: d,
        });
      }
    }
  }

  return logsToInsert;
}

export async function updateLogs(
  pendingLogs: NewLog[],
): Promise<[number, Map<string, number>]> {
  let successCount = 0;
  const userMap = new Map<string, number>(); // userId -> accumulated points
  await db.transaction(async (tx) => {
    // Step 1: Insert logs and accumulate points only if insertion succeeds
    const inserted = await tx
      .insert(logs)
      .values(pendingLogs)
      .onConflictDoNothing({
        target: [logs.userId, logs.taskDate, logs.type],
      })
      .returning({ id: logs.id, userId: logs.userId, points: logs.points });

    // Track how many were inserted
    successCount = inserted.length;

    for (const log of inserted) {
      // Accumulate points for user if inserted
      userMap.set(log.userId, (userMap.get(log.userId) ?? 0) + log.points);
    }

    // Step 2: Update totalPoints and freezeCardCount for users who had logs inserted
  });

  return [successCount, userMap];
}

export function checkNewLogsForStreak(logs: NewLog[]) {
  const streakMap = new Map<string, boolean>();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  for (const log of logs) {
    if (
      log.type === "task" &&
      (log.status === "worked" ||
        log.status === "freeze_card" ||
        log.status === "no_task") &&
      log.taskDate
    ) {
      const logDate = new Date(log.taskDate);
      logDate.setHours(0, 0, 0, 0);

      if (logDate.getTime() === yesterday.getTime()) {
        streakMap.set(log.userId, true);
      }
    }
  }

  return streakMap;
}

// export async function updatePointsFreezeStreak(
//   taskUserData: Map<
//     string,
//     {
//       userId: string;
//       lastDate: Date | null;
//       streak: number;
//       totalPoints: number;
//     }
//   >,
//   logsToInsert: NewLog[],
//   userMap: Map<string, number>,
// ): Promise<void> {
//   const streakMap = checkNewLogsForStreak(logsToInsert);

//   for (const [userId, newPoints] of userMap.entries()) {
//     // Get previous user data
//     const result = {
//       ...taskUserData.get(userId),
//     };

//     const prevPoints = result?.totalPoints ?? 0;
//     const prevStreak = result?.streak ?? 0;

//     const newTotal = prevPoints + newPoints;

//     const prevThresholds = Math.floor(prevPoints / 50);
//     const newThresholds = Math.floor(newTotal / 50);
//     const thresholdsCrossed = Math.max(0, newThresholds - prevThresholds);

//     const incrementStreak = streakMap.get(userId) ? prevStreak + 1 : 0;

//     await db
//       .update(schema.users)
//       .set({
//         totalPoints: newTotal,
//         freezeCardCount: sql`${schema.users.freezeCardCount} + ${thresholdsCrossed}`,
//         streak: incrementStreak,
//       })
//       .where(eq(schema.users.id, userId));
//   }
// }

export async function updatePointsFreezeStreak(
  taskUserData: Map<
    string,
    {
      userId: string;
      lastDate: Date | null;
      streak: number;
      totalPoints: number;
    }
  >,
  logsToInsert: NewLog[],
  userMap: Map<string, number>,
): Promise<void> {
  const streakMap = checkNewLogsForStreak(logsToInsert);

  const ids: string[] = [];
  const totalPointsCases: string[] = [];
  const freezeCardCases: string[] = [];
  const streakCases: string[] = [];

  // Convert taskUserData to a Map from userId to user data for efficient lookup
  const userIdDataMap = new Map<
    string,
    {
      userId: string;
      lastDate: Date | null;
      streak: number;
      totalPoints: number;
    }
  >();
  for (const userData of taskUserData.values()) {
    userIdDataMap.set(userData.userId, userData);
  }

  for (const [userId, newPoints] of userMap.entries()) {
    const result = userIdDataMap.get(userId);
    if (!result) continue;

    const prevPoints = result.totalPoints ?? 0;
    const prevStreak = result.streak ?? 0;

    const newTotal = prevPoints + newPoints;

    const prevThresholds = Math.floor(prevPoints / 50);
    const newThresholds = Math.floor(newTotal / 50);
    const thresholdsCrossed = Math.max(0, newThresholds - prevThresholds);

    const newStreak = streakMap.get(userId) ? prevStreak + 1 : 0;

    ids.push(`'${userId}'`);
    totalPointsCases.push(`WHEN '${userId}' THEN ${newTotal}`);
    freezeCardCases.push(
      `WHEN '${userId}' THEN "freeze_card_count" + ${thresholdsCrossed}`,
    );
    streakCases.push(`WHEN '${userId}' THEN ${newStreak}`);
  }

  if (ids.length === 0) return;

  const query = sql.raw(`
    UPDATE users
    SET
      total_points = CASE id
        ${totalPointsCases.join("\n")}
      END,
      freeze_card_count = CASE id
        ${freezeCardCases.join("\n")}
      END,
      streak = CASE id
        ${streakCases.join("\n")}
      END
    WHERE id IN (${ids.join(", ")});
  `);

  await db.execute(query);
}
