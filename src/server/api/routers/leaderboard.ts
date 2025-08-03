import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { logs, users } from "@/server/db/schema";
import { eq, asc, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
export const leaderboardRouter = createTRPCRouter({
  // GET /api/leaderboard
  getLeaderboard: publicProcedure.query(async () => {
    const leaderboard = await db
      .select({
        userId: users.id,
        username: users.name,
        githubUsername: users.github,
        totalPoints: users.totalPoints,
        streak: users.streak,
        freezeCardCount: users.freezeCardCount,
      })
      .from(users)
      .orderBy(desc(users.totalPoints), desc(users.streak));

    return leaderboard;
  }),

  // GET /api/leaderboard/:userId
  getUserLogs: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const user = await db
        .select({
          name: users.name,
          githubUsername: users.github,
          streak: users.streak,
          totalPoints: users.totalPoints,
          freezeCardCount: users.freezeCardCount,
        })
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
          description: logs.description,
          taskDate: logs.taskDate,
          createdAt: logs.createdAt,
        })
        .from(logs)
        .where(eq(logs.userId, input.userId))
        .orderBy(asc(logs.taskDate));

      // stays separate as it has logic

      return {
        rank: 0,
        username: user.name,
        githubUsername: user.githubUsername,
        logs: logsList,
        totalPoints: user.totalPoints,
        streak: user.streak,
        freezeCardCount: user.freezeCardCount,
      };
    }),
});
