import { runCronJob } from "@/server/tasks/cron";
import { env } from "@/env";
import { db } from "@/server/db";
import { cronStatus } from "@/server/db/schema";
import { sql } from "drizzle-orm";
import type { NextRequest } from "next/server";

// Replace with your actual webhook URL
const DISCORD_WEBHOOK_URL =
  typeof (env.DISCORD_WEBHOOK_URL as unknown) === "string"
    ? (env.DISCORD_WEBHOOK_URL as string)
    : "";

async function sendDiscordNotification(content: string) {
  await fetch(DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
}

export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const startTime = Date.now();
  let cronId: string | undefined;

  try {
    // Insert initial "running" status
    const result = await db
      .insert(cronStatus)
      .values({ status: "running", timeTaken: 0 })
      .returning({ id: cronStatus.id });

    cronId = result[0]?.id;

    await runCronJob();

    const duration = Date.now() - startTime; // in milliseconds

    // Update to success
    if (cronId) {
      await db
        .update(cronStatus)
        .set({ status: "success", timeTaken: duration })
        .where(sql`id = ${cronId}`);
    }

    await sendDiscordNotification(`✅ Cron job succeeded in ${duration}s`);

    return new Response(
      JSON.stringify({ success: true, message: "Cron job ran successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    const duration = Math.floor((Date.now() - startTime) / 1000);

    if (cronId) {
      await db
        .update(cronStatus)
        .set({ status: "failed", timeTaken: duration })
        .where(sql`id = ${cronId}`);
    }

    await sendDiscordNotification(
      `❌ Cron job failed after ${duration}s\n\nError: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );

    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to run cron job",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
