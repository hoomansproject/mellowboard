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
    description: string | null;
  };
  function groupLogsByDate(logs: Log[]): Record<string, Log[]> {
    return logs.reduce<Record<string, Log[]>>((acc, log) => {
      const d = log.taskDate;
      if (!(d instanceof Date) || isNaN(d.getTime())) return acc;

      // Construct a local date key in YYYY-MM-DD format
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0"); // Months are 0-based
      const day = String(d.getDate()).padStart(2, "0");
      const key = `${year}-${month}-${day}`;

      acc[key] ??= [];
      acc[key].push(log);

      return acc;
    }, {});
  }

  const groupedLogs = groupLogsByDate(user?.logs ?? []);
  const getStatusDisplay = (status: Log["status"]) => {
    switch (status) {
      case "worked":
        return {
          label: "Worked",
          color: "text-green-600",
          bgColor: "bg-green-100",
        };
      case "not_available":
        return {
          label: "Not Available",
          color: "text-red-600",
          bgColor: "bg-red-100",
        };
      case "no_task":
        return {
          label: "No Task",
          color: "text-gray-600",
          bgColor: "bg-gray-100",
        };
      case "freeze_card":
        return {
          label: "Freeze Card",
          color: "text-blue-600",
          bgColor: "bg-blue-100",
        };
      default:
        return {
          label: status,
          color: "text-gray-600",
          bgColor: "bg-gray-100",
        };
    }
  };

  const getDisplayText = (type: Log["type"], status: Log["status"]) => {
    if (type === "meeting") {
      return status === "worked"
        ? "Meeting Attended"
        : status === "no_task"
          ? "Not Attended But Informed"
          : "Not Available";
    }
    if (type === "task") {
      return status === "worked"
        ? "Work Done"
        : status === "no_task"
          ? "No Task"
          : status === "freeze_card"
            ? "Freeze Card"
            : "Not Available";
    }
  };

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
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none sm:px-4"
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
          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
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
        <div className="space-y-4 p-2 sm:space-y-6 sm:p-6">
          {Object.entries(groupedLogs)
            .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
            .map(([date, logs]) => (
              <div key={date} className="space-y-2 sm:space-y-3">
                {/* Date Header */}
                <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                  <h3 className="text-sm font-semibold sm:text-base">
                    <span className="sm:hidden">{formatDateMobile(date)}</span>
                    <span className="hidden sm:inline">{formatDate(date)}</span>
                  </h3>
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                    {logs.length}{" "}
                    {logs.length === 1 ? "activity" : "activities"}
                  </span>
                </div>

                {/* Individual Logs */}
                <div className="space-y-2">
                  {logs
                    .sort((a, b) => {
                      const timeA = a.createdAt
                        ? new Date(a.createdAt).getTime()
                        : 0;
                      const timeB = b.createdAt
                        ? new Date(b.createdAt).getTime()
                        : 0;
                      return timeB - timeA;
                    })
                    .map((log) => {
                      const statusInfo = getStatusDisplay(log.status);

                      return (
                        <div
                          key={log.id}
                          className="flex flex-row justify-between gap-2 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:gap-4"
                        >
                          <div className="flex min-w-0 flex-1 items-center gap-3">
                            <div
                              className={`flex-shrink-0 rounded-full p-1.5 ${
                                log.points > 0
                                  ? "bg-green-100 text-green-600"
                                  : log.points < 0
                                    ? "bg-red-100 text-red-600"
                                    : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {log.points > 0 ? (
                                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                              ) : log.points < 0 ? (
                                <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                              ) : (
                                <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                                <p className="text-sm font-medium">
                                  {getDisplayText(log.type, log.status)}
                                </p>
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}
                                >
                                  {log.type === "meeting"
                                    ? "Meeting"
                                    : statusInfo.label}
                                </span>
                              </div>
                              {log.description && (
                                <p className="mt-1 text-sm text-gray-500">
                                  {log.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-between text-right sm:block">
                            <p
                              className={`text-base font-bold ${
                                log.points > 0
                                  ? "text-green-600"
                                  : log.points < 0
                                    ? "text-red-600"
                                    : "text-gray-600"
                              }`}
                            >
                              {log.points > 0 ? "+" : ""}
                              {log.points}
                            </p>
                            {log.createdAt && (
                              <p className="hidden text-sm text-gray-500 sm:block">
                                <span>Recorded At: </span>
                                {new Date(log.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
