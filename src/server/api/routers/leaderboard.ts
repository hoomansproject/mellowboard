import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { logs, users } from "@/server/db/schema";
import { sql, eq, asc } from "drizzle-orm";
import { getUserStreak } from "@/server/utils/log-helpers";
import { TRPCError } from "@trpc/server";

export const leaderboardRouter = createTRPCRouter({
  // GET /api/leaderboard
  getLeaderboard: publicProcedure.query(async () => {
    const results = await db
      .select({
        userId: logs.userId,
        username: users.name,
        totalPoints: sql<number>`SUM(${logs.points})`.as("totalPoints"),
        githubUsername: users.github,
      })
      .from(logs)
      .innerJoin(users, eq(logs.userId, users.id))
      .groupBy(logs.userId, users.name, users.github)
      .orderBy(sql`SUM(${logs.points}) DESC`);

    const streakResults = await Promise.all(
      results.map(async (result) => {
        return {
          userId: result.userId,
          username: result.username,
          totalPoints: result.totalPoints,
          githubUsername: result.githubUsername,
          streak: await getUserStreak(result.userId),
        };
      }),
    );

    return streakResults;
  }),

  // GET /api/leaderboard/:userId
  getUserLogs: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const user = await db
        .select({ name: users.name, githubUsername: users.github })
        .from(users)
        .where(eq(users.id, input.userId))
        .then((res) => res[0]);

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found." });
      }

      const logsList = await db
        .select({
          id: logs.id,
          type: logs.type,
          status: logs.status,
          points: logs.points,
          taskDate: logs.taskDate,
          createdAt: logs.createdAt,
        })
        .from(logs)
        .where(eq(logs.userId, input.userId))
        .orderBy(asc(logs.taskDate));

      const totalPoints = logsList.reduce(
        (acc, log) => acc + (log?.points ?? 0),
        0,
      );

      const streak = await getUserStreak(input.userId); // stays separate as it has logic

      return {
        rank: 0,
        username: user.name,
        githubUsername: user.githubUsername,
        logs: logsList,
        totalPoints,
        streak,
      };
    }),
});
