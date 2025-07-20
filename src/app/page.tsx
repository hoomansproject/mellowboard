import Leaderboard from "@/app/_components/leaderboard";
import { api, HydrateClient } from "@/trpc/server";

export default async function Home() {
  const dehydratedState = await api.leaderboard.getLeaderboard.prefetch();
  return (
    <HydrateClient state={dehydratedState}>
      <main className="flex min-h-screen flex-col items-center justify-center text-black">
        <Leaderboard />
      </main>
    </HydrateClient>
  );
}
