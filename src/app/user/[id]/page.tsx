"use client";

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
  const userId = params.id as string;

  const user = userData[userId as unknown as keyof typeof userData];

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-4xl p-4">
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="p-8 text-center">
            <h2 className="mb-2 text-xl font-semibold">User not found</h2>
            <p className="mb-4 text-gray-500">
              The user you&apos;re looking for doesn&apos;t exist.
            </p>
            <button
              onClick={() => router.push("/")}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
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
    <div className="mx-auto w-full max-w-4xl space-y-6 p-4">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Leaderboard
        </button>
      </div>

      {/* User Profile Card */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-6">
            <div className="relative h-20 w-20">
              {user.avatar && (
                <Image
                  src={user.avatar}
                  alt={user.name}
                  fill
                  className="h-20 w-20 rounded-full object-cover"
                  onError={() => console.log("Error loading image")}
                />
              )}
            </div>

            <div className="flex-1">
              <div className="mb-2 flex items-center gap-3">
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <span className="inline-flex items-center rounded-full border border-gray-300 bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                  Rank #{user.rank}
                </span>
              </div>
              <p className="mb-3 text-gray-500">{user.username}</p>

              <div className="flex gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="font-semibold">
                    {user.totalPoints.toLocaleString()}
                  </span>
                  <span className="text-gray-500">total points</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-orange-500" />
                  <span className="font-semibold">{user.currentStreak}</span>
                  <span className="text-gray-500">day streak</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Point Logs */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Calendar className="h-5 w-5" />
            Daily Activity
          </h2>
        </div>
        <div className="space-y-3 p-6">
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
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="min-w-[60px] text-center">
                      <p className="text-sm font-semibold">
                        {formatDate(date).split(",")[0]}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(date).toLocaleDateString("en-US", {
                          weekday: "short",
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div
                        className={`rounded-full p-2 ${
                          dayTotal > 0
                            ? "bg-green-100 text-green-600"
                            : dayTotal < 0
                              ? "bg-red-100 text-red-600"
                              : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {dayTotal > 0 ? (
                          <Plus className="h-4 w-4" />
                        ) : dayTotal < 0 ? (
                          <Minus className="h-4 w-4" />
                        ) : (
                          <Activity className="h-4 w-4" />
                        )}
                      </div>

                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {mainActivity?.activity}
                        </p>
                        {logs.length > 1 && (
                          <p className="text-xs text-gray-500">
                            +{logs.length - 1} more{" "}
                            {logs.length === 2 ? "activity" : "activities"}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          {mainActivity?.time}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`text-lg font-bold ${
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
                    <p className="text-xs text-gray-500">
                      Total: {mainActivity?.runningTotal.toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
