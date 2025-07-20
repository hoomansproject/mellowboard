// src/app/api/run-cron-job.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { runCronJob } from "@/server/tasks/cron";
import { env } from "@/env";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.headers.authorization !== `Bearer ${env.CRON_SECRET}`) {
    return res.status(401).end("Unauthorized");
  }
  await runCronJob();
  res.status(200).json({ success: true, message: "Cron job executed" });
}
