// src/pages/api/run-cron-job.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { runCronJob } from "@/server/tasks/cron";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).end("Unauthorized");
  }
  await runCronJob();
  res.status(200).json({ success: true });
}
