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
import { useParams, useRouter } from "next/navigation";

// Mock user data - in a real app, this would come from an API
const userData = {
  1: {
    id: 1,
    name: "Alex Chen",
    username: "@alexc",
    avatar: "/placeholder.svg?height=80&width=80",
    totalPoints: 2847,
    currentStreak: 23,
    rank: 1,
  },
  2: {
    id: 2,
    name: "Sarah Johnson",
    username: "@sarahj",
    avatar: "/placeholder.svg?height=80&width=80",
    totalPoints: 2654,
    currentStreak: 18,
    rank: 2,
  },
  3: {
    id: 3,
    name: "Mike Rodriguez",
    username: "@miker",
    avatar: "/placeholder.svg?height=80&width=80",
    totalPoints: 2431,
    currentStreak: 15,
    rank: 3,
  },
  4: {
    id: 4,
    name: "Emma Wilson",
    username: "@emmaw",
    avatar: "/placeholder.svg?height=80&width=80",
    totalPoints: 2298,
    currentStreak: 12,
    rank: 4,
  },
  5: {
    id: 5,
    name: "David Kim",
    username: "@davidk",
    avatar: "/placeholder.svg?height=80&width=80",
    totalPoints: 2156,
    currentStreak: 9,
    rank: 5,
  },
  6: {
    id: 6,
    name: "Lisa Thompson",
    username: "@lisat",
    avatar: "/placeholder.svg?height=80&width=80",
    totalPoints: 1987,
    currentStreak: 7,
    rank: 6,
  },
  7: {
    id: 7,
    name: "James Brown",
    username: "@jamesb",
    avatar: "/placeholder.svg?height=80&width=80",
    totalPoints: 1834,
    currentStreak: 5,
    rank: 7,
  },
  8: {
    id: 8,
    name: "Anna Garcia",
    username: "@annag",
    avatar: "/placeholder.svg?height=80&width=80",
    totalPoints: 1672,
    currentStreak: 4,
    rank: 8,
  },
};

// Mock point logs data
const pointLogs = [
  {
    id: 1,
    date: "2024-01-20",
    time: "14:30",
    activity: "Daily Challenge Completed",
    points: 50,
    type: "earned",
    runningTotal: 2847,
  },
  {
    id: 2,
    date: "2024-01-20",
    time: "09:15",
    activity: "Quiz Perfect Score",
    points: 100,
    type: "earned",
    runningTotal: 2797,
  },
  {
    id: 3,
    date: "2024-01-19",
    time: "16:45",
    activity: "Streak Bonus",
    points: 25,
    type: "earned",
    runningTotal: 2697,
  },
  {
    id: 4,
    date: "2024-01-19",
    time: "11:20",
    activity: "Task Completion",
    points: 75,
    type: "earned",
    runningTotal: 2672,
  },
  {
    id: 5,
    date: "2024-01-18",
    time: "20:10",
    activity: "Late Submission Penalty",
    points: 10,
    type: "lost",
    runningTotal: 2597,
  },
  {
    id: 6,
    date: "2024-01-18",
    time: "13:30",
    activity: "Weekly Goal Achieved",
    points: 200,
    type: "earned",
    runningTotal: 2607,
  },
  {
    id: 7,
    date: "2024-01-17",
    time: "15:45",
    activity: "Collaboration Bonus",
    points: 30,
    type: "earned",
    runningTotal: 2407,
  },
  {
    id: 8,
    date: "2024-01-17",
    time: "10:00",
    activity: "Morning Challenge",
    points: 40,
    type: "earned",
    runningTotal: 2377,
  },
  {
    id: 9,
    date: "2024-01-16",
    time: "18:20",
    activity: "Achievement Unlocked",
    points: 150,
    type: "earned",
    runningTotal: 2337,
  },
  {
    id: 10,
    date: "2024-01-16",
    time: "12:15",
    activity: "Daily Login Bonus",
    points: 10,
    type: "earned",
    runningTotal: 2187,
  },
];

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const userData = params.id as string;

  const userId = userData.slice(0, -1);
  const userRank = parseInt(userData.at(-1) ?? "0") + 1;

  const [user] = api.leaderboard.getUserLogs.useSuspenseQuery({
    userId,
  });

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

  const groupLogsByDate = (logs: typeof pointLogs) => {
    const grouped: Record<string, typeof pointLogs> = {};
    logs.forEach((log) => {
      grouped[log.date] ??= [];
      grouped[log.date]?.push(log);
    });
    return grouped;
  };

  const groupedLogs = groupLogsByDate(pointLogs);

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
                {user.username}
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
                  sum + (log.type === "earned" ? log.points : -log.points),
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
                          {mainActivity?.activity}
                        </p>
                        {logs.length > 1 && (
                          <p className="text-xs text-gray-500">
                            +{logs.length - 1} more{" "}
                            {logs.length === 2 ? "activity" : "activities"}
                          </p>
                        )}
                        <p className="hidden text-xs text-gray-500 sm:block">
                          {mainActivity?.time}
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
                        Total: {mainActivity?.runningTotal.toLocaleString()}
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
