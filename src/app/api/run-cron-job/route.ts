import { runCronJob } from "@/server/tasks/cron";
import { env } from "@/env";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  await runCronJob();
  return new Response(
    JSON.stringify({
      success: true,
      message: "Cron job ran successfully",
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
}
