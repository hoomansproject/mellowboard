"use client";

import { api } from "@/trpc/react";
import {
  ArrowLeft,
  TrendingUp,
  Plus,
  Minus,
  Calendar,
  Activity,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";

export default function UserDetailsPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const userRank = useSearchParams().get("rank")!;

  const { data: user, isLoading } = api.leaderboard.getUserLogs.useQuery({
    userId: id,
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateMobile = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };
  type Log = {
    id: string;
    type: "meeting" | "task";
    status: "worked" | "not_available" | "no_task" | "freeze_card";
    points: number;
    taskDate: Date | null;
    createdAt: Date | null;
  };
  function groupLogsByDate(logs: Log[]): Record<string, Log[]> {
    return logs.reduce<Record<string, Log[]>>((acc, log) => {
      const d = log.taskDate;
      if (!(d instanceof Date) || isNaN(d.getTime())) return acc;

      const key = d.toISOString().slice(0, 10); // “2025-07-21”
      acc[key] ??= [];
      acc[key].push(log);
      return acc;
    }, {});
  }

  const groupedLogs = groupLogsByDate(user?.logs ?? []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div
          className="h-8 w-8 animate-spin rounded-full border-4 border-t-2 border-gray-500"
          role="status"
          aria-label="Loading"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-4xl p-2 sm:p-4">
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="p-6 text-center sm:p-8">
            <h2 className="mb-2 text-lg font-semibold sm:text-xl">
              User not found
            </h2>
            <p className="mb-4 text-sm text-gray-500 sm:text-base">
              The user you&apos;re looking for doesn&apos;t exist.
            </p>
            <button
              onClick={() => router.push("/")}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none sm:px-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Leaderboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 p-2 sm:space-y-6 sm:p-4">
      {/* Header */}
      <div className="mb-4 flex items-center gap-4 sm:mb-6">
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
        >
          <ArrowLeft className="mr-1 h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Back to Leaderboard</span>
          <span className="sm:hidden">Back</span>
        </button>
      </div>

      {/* User Profile Card */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
            <div className="relative h-16 w-16 flex-shrink-0 sm:h-20 sm:w-20">
              <Image
                src={
                  user.githubUsername
                    ? `https://github.com/${user.githubUsername}.png`
                    : "/placeholder.svg"
                }
                alt={user.username}
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="h-16 w-16 rounded-full object-cover sm:h-20 sm:w-20"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="mb-2 flex flex-col items-center gap-2 sm:flex-row sm:items-start sm:gap-3">
                <h1 className="text-xl font-bold sm:text-2xl">
                  {user.username}
                </h1>
                <span className="inline-flex items-center rounded-full border border-gray-300 bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                  Rank #{userRank}
                </span>
              </div>
              <p className="mb-3 text-sm text-gray-500 sm:text-base">
                {user.githubUsername ? (
                  <a
                    href={`https://github.com/${user.githubUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-blue-500"
                  >
                    @{user.githubUsername}
                  </a>
                ) : (
                  "No GitHub username found"
                )}
              </p>

              <div className="flex flex-col gap-4 text-sm sm:flex-row sm:gap-6">
                <div className="flex items-center justify-center gap-2 sm:justify-start">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="font-semibold">
                    {user.totalPoints.toLocaleString()}
                  </span>
                  <span className="text-gray-500">total points</span>
                </div>
                <div className="flex items-center justify-center gap-2 sm:justify-start">
                  <Activity className="h-4 w-4 text-orange-500" />
                  <span className="font-semibold">{user.streak}</span>
                  <span className="text-gray-500">day streak</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Point Logs */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-4 sm:p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
            Daily Activity
          </h2>
        </div>
        <div className="space-y-2 p-2 sm:space-y-3 sm:p-6">
          {Object.entries(groupedLogs)
            .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
            .map(([date, logs]) => {
              const dayTotal = logs.reduce(
                (sum, log) =>
                  sum + (log.type === "task" ? log.points : -log.points),
                0,
              );
              const mainActivity =
                logs.find(
                  (log) =>
                    log.points === Math.max(...logs.map((l) => l.points)),
                ) ?? logs[0];

              return (
                <div
                  key={date}
                  className="flex flex-col justify-between gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:gap-4 sm:p-4"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
                    <div className="min-w-[50px] flex-shrink-0 text-center sm:min-w-[60px]">
                      <p className="text-xs font-semibold sm:text-sm">
                        <span className="sm:hidden">
                          {formatDateMobile(date)}
                        </span>
                        <span className="hidden sm:inline">
                          {formatDate(date).split(",")[0]}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(date).toLocaleDateString("en-US", {
                          weekday: "short",
                        })}
                      </p>
                    </div>

                    <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                      <div
                        className={`flex-shrink-0 rounded-full p-1.5 sm:p-2 ${
                          dayTotal > 0
                            ? "bg-green-100 text-green-600"
                            : dayTotal < 0
                              ? "bg-red-100 text-red-600"
                              : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {dayTotal > 0 ? (
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                        ) : dayTotal < 0 ? (
                          <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                        ) : (
                          <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {mainActivity?.type}
                        </p>
                        {logs.length > 1 && (
                          <p className="text-xs text-gray-500">
                            +{logs.length - 1} more{" "}
                            {logs.length === 2 ? "activity" : "activities"}
                          </p>
                        )}
                        <p className="hidden text-xs text-gray-500 sm:block">
                          {mainActivity?.taskDate?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between text-right sm:block sm:text-right">
                    <div>
                      <p
                        className={`text-base font-bold sm:text-lg ${
                          dayTotal > 0
                            ? "text-green-600"
                            : dayTotal < 0
                              ? "text-red-600"
                              : "text-gray-600"
                        }`}
                      >
                        {dayTotal > 0 ? "+" : ""}
                        {dayTotal}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">
                        Total: {mainActivity?.points}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
