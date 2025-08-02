import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";

export const cronRouter = createTRPCRouter({
  getCronStatuses: publicProcedure.query(async () => {
    const cronStatuses = await db.query.cronStatus.findMany();
    return cronStatuses;
  }),
});
