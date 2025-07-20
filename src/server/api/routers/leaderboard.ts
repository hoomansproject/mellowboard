import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { logs, users } from "@/server/db/schema";
import { sql, eq } from "drizzle-orm";

export const leaderboardRouter = createTRPCRouter({
  // GET /api/leaderboard
  getLeaderboard: publicProcedure.query(async () => {
    const results = await db
      .select({
        userId: logs.userId,
        username: users.name,
        totalPoints: sql<number>`SUM(${logs.points})`.as("totalPoints"),
      })
      .from(logs)
      .innerJoin(users, eq(logs.userId, users.id))
      .groupBy(logs.userId, users.name)
      .orderBy(sql`SUM(${logs.points}) DESC`);

    return results;
  }),

  // GET /api/leaderboard/:userId
  getUserLogs: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const userLogs = await db
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
        .orderBy(logs.taskDate); // optional: or .orderBy(desc(logs.taskDate))

      return userLogs;
    }),
});
