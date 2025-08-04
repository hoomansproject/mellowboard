"use client";

import { api } from "@/trpc/react";

import {
  Trophy,
  Flame,
  Star,
  Medal,
  Award,
  AlertCircle,
  Shield,
  PanelTopInactive,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Trophy className="h-4 w-4 text-yellow-500 sm:h-5 sm:w-5" />;
    case 2:
      return <Medal className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5" />;
    case 3:
      return <Award className="h-4 w-4 text-amber-600 sm:h-5 sm:w-5" />;
    default:
      return (
        <span className="flex h-4 w-4 items-center justify-center text-xs font-bold text-gray-500 sm:h-5 sm:w-5 sm:text-sm">
          #{rank}
        </span>
      );
  }
}

function getRankBadge(rank: number) {
  switch (rank) {
    case 1:
      return (
        <span className="inline-flex items-center rounded-full bg-yellow-500 px-2 py-1 text-xs font-medium text-white sm:px-2.5 sm:py-0.5">
          1st
        </span>
      );
    case 2:
      return (
        <span className="inline-flex items-center rounded-full bg-gray-400 px-2 py-1 text-xs font-medium text-white sm:px-2.5 sm:py-0.5">
          2nd
        </span>
      );
    case 3:
      return (
        <span className="inline-flex items-center rounded-full bg-amber-600 px-2 py-1 text-xs font-medium text-white sm:px-2.5 sm:py-0.5">
          3rd
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center rounded-full border border-gray-300 bg-gray-200 px-2 py-1 text-xs font-medium text-gray-800 sm:px-2.5 sm:py-0.5">
          #{rank}
        </span>
      );
  }
}

export default function Component() {
  const { data: leaderboard, isLoading } =
    api.leaderboard.getLeaderboard.useQuery();

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-4xl p-2 sm:p-4">
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="p-6 text-center sm:p-8">
            <h2 className="mb-2 text-lg font-semibold sm:text-xl">
              Loading leaderboard...
            </h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 p-2 sm:space-y-6 sm:p-4">
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-4 text-center sm:p-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex-1"></div>
            <h2 className="flex items-center justify-center gap-2 text-xl font-bold sm:text-2xl">
              <Trophy className="h-5 w-5 text-yellow-500 sm:h-6 sm:w-6" />
              Leaderboard
            </h2>
            <div className="flex flex-1 justify-end">
              <button
                onClick={() => (window.location.href = "/rules")}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
              >
                <AlertCircle className="mr-1 h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Rules</span>
                <span className="sm:hidden">Rules</span>
              </button>
            </div>
          </div>
        </div>
        <div className="space-y-1 p-2 sm:space-y-2 sm:p-6">
          {leaderboard?.map((user, idx) => (
            <Link
              key={user.userId}
              href={user.active ? `/user/${user.userId}?rank=${idx + 1}` : "#"}
              tabIndex={user.active ? 0 : -1}
              aria-disabled={!user.active}
              className={`flex w-full cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors sm:p-4 ${
                user.active
                  ? "border-gray-200 hover:bg-gray-50"
                  : "pointer-events-none cursor-not-allowed border-gray-200 bg-white opacity-50 select-none"
              }`}
            >
              <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
                <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
                  {getRankIcon(idx + 1)}
                  <div className="hidden sm:block">{getRankBadge(idx + 1)}</div>
                </div>

                <div className="relative h-8 w-8 flex-shrink-0 sm:h-10 sm:w-10">
                  <Image
                    src={
                      user.githubUsername
                        ? `https://github.com/${user.githubUsername}.png`
                        : "/placeholder.svg"
                    }
                    alt={user.username}
                    fill
                    className="h-8 w-8 rounded-full object-cover sm:h-10 sm:w-10"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                </div>

                <div className="min-w-0 flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-semibold sm:text-base">
                      {user.username}
                    </h3>
                    <div className="sm:hidden">{getRankBadge(idx + 1)}</div>
                  </div>
                  <p className="hidden text-xs text-gray-500 sm:block">
                    {user.githubUsername && "@" + user.githubUsername}
                  </p>
                </div>
              </div>

              <div className="flex flex-shrink-0 flex-col items-end gap-2 text-xs sm:flex-row sm:items-center sm:gap-6 sm:text-sm">
                {!user.active ? (
                  <div className="flex items-center gap-1">
                    <PanelTopInactive className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="font-semibold">{"Inactive"}</span>
                  </div>
                ) : null}
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-500 sm:h-4 sm:w-4" />
                  <span className="font-semibold">
                    {user.totalPoints.toLocaleString()}
                  </span>
                  <span className="hidden text-gray-500 lg:inline">pts</span>
                </div>

                <div className="flex items-center gap-1">
                  <Flame className="h-3 w-3 text-orange-500 sm:h-4 sm:w-4" />
                  <span className="font-semibold">{user.streak}</span>
                  <span className="hidden text-gray-500 lg:inline">
                    day{user.streak !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3 text-blue-500 sm:h-4 sm:w-4" />
                  <span className="font-semibold">{user.freezeCardCount}</span>
                  <span className="hidden text-gray-500 lg:inline">FC</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {/* Subtle admin link */}
        <div className="p-2 text-right">
          <Link
            href="/cron-jobs"
            className="text-xs text-gray-400 transition-colors hover:text-gray-600"
          >
            system
          </Link>
        </div>
      </div>
    </div>
  );
}
