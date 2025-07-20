"use client";

import { api } from "@/trpc/react";

import { Trophy, Flame, Star, Medal, Award } from "lucide-react";
import Image from "next/image";

export function Leaderboard() {
  const [latestPost] = api.post.getLatest.useSuspenseQuery();
  const [leaderboard] = api.leaderboard.getLeaderboard.useSuspenseQuery();
  // const utils = api.useUtils();
  // const [name, setName] = useState("");
  // const createPost = api.post.create.useMutation({
  //   onSuccess: async () => {
  //     await utils.post.invalidate();
  //     setName("");
  //   },
  // });

  return (
    <div>
      <h2 className="text-2xl font-bold">Latest Post</h2>
      <p>{latestPost?.name}</p>

      <h2 className="mt-4 text-2xl font-bold">Leaderboard</h2>
      <ul className="mt-4 flex flex-col gap-2">
        {leaderboard?.map((user) => (
          <li key={user.userId} className="flex items-center gap-4">
            <span className="text-lg font-medium">{user.username}</span>
            <span className="text-lg font-medium">{user.totalPoints}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const leaderboardData = [
  {
    id: 1,
    rank: 1,
    name: "Alex Chen",
    username: "@alexc",
    avatar: "/placeholder.svg?height=40&width=40",
    points: 2847,
    streak: 23,
    isCurrentUser: false,
  },
  {
    id: 2,
    rank: 2,
    name: "Sarah Johnson",
    username: "@sarahj",
    avatar: "/placeholder.svg?height=40&width=40",
    points: 2654,
    streak: 18,
    isCurrentUser: false,
  },
  {
    id: 3,
    rank: 3,
    name: "Mike Rodriguez",
    username: "@miker",
    avatar: "/placeholder.svg?height=40&width=40",
    points: 2431,
    streak: 15,
    isCurrentUser: false,
  },
  {
    id: 4,
    rank: 4,
    name: "Emma Wilson",
    username: "@emmaw",
    avatar: "/placeholder.svg?height=40&width=40",
    points: 2298,
    streak: 12,
    isCurrentUser: true,
  },
  {
    id: 5,
    rank: 5,
    name: "David Kim",
    username: "@davidk",
    avatar: "/placeholder.svg?height=40&width=40",
    points: 2156,
    streak: 9,
    isCurrentUser: false,
  },
  {
    id: 6,
    rank: 6,
    name: "Lisa Thompson",
    username: "@lisat",
    avatar: "/placeholder.svg?height=40&width=40",
    points: 1987,
    streak: 7,
    isCurrentUser: false,
  },
  {
    id: 7,
    rank: 7,
    name: "James Brown",
    username: "@jamesb",
    avatar: "/placeholder.svg?height=40&width=40",
    points: 1834,
    streak: 5,
    isCurrentUser: false,
  },
  {
    id: 8,
    rank: 8,
    name: "Anna Garcia",
    username: "@annag",
    avatar: "/placeholder.svg?height=40&width=40",
    points: 1672,
    streak: 4,
    isCurrentUser: false,
  },
];

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Trophy className="h-5 w-5 text-yellow-500" />;
    case 2:
      return <Medal className="h-5 w-5 text-gray-400" />;
    case 3:
      return <Award className="h-5 w-5 text-amber-600" />;
    default:
      return (
        <span className="flex h-5 w-5 items-center justify-center text-sm font-bold text-gray-500">
          #{rank}
        </span>
      );
  }
}

function getRankBadge(rank: number) {
  switch (rank) {
    case 1:
      return (
        <span className="inline-flex items-center rounded-full bg-yellow-500 px-2.5 py-0.5 text-xs font-medium text-white">
          1st
        </span>
      );
    case 2:
      return (
        <span className="inline-flex items-center rounded-full bg-gray-400 px-2.5 py-0.5 text-xs font-medium text-white">
          2nd
        </span>
      );
    case 3:
      return (
        <span className="inline-flex items-center rounded-full bg-amber-600 px-2.5 py-0.5 text-xs font-medium text-white">
          3rd
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center rounded-full border border-gray-300 bg-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-800">
          #{rank}
        </span>
      );
  }
}

export default function Component() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-4">
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-6 text-center">
          <h2 className="flex items-center justify-center gap-2 text-2xl font-bold">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Leaderboard
          </h2>
        </div>
        <div className="space-y-2 p-6">
          {leaderboardData.map((user) => (
            <button
              key={user.id}
              onClick={() => (window.location.href = `/user/${user.id}`)}
              className={`flex w-full cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors ${
                user.isCurrentUser
                  ? "border-blue-200 bg-blue-50 hover:bg-blue-100"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div className="flex flex-1 items-center gap-4">
                <div className="flex items-center gap-3">
                  {getRankIcon(user.rank)}
                  {getRankBadge(user.rank)}
                </div>

                <div className="relative h-10 w-10">
                  <Image
                    src={user.avatar || "https://picsum.photos/200/300"}
                    alt={user.name}
                    fill
                    className="h-10 w-10 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://placehold.co/600x400@2x.png";
                    }}
                  />
                </div>

                <div className="min-w-0 flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-semibold">
                      {user.name}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500">{user.username}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-semibold">
                    {user.points.toLocaleString()}
                  </span>
                  <span className="hidden text-gray-500 sm:inline">pts</span>
                </div>

                <div className="flex items-center gap-1">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="font-semibold">{user.streak}</span>
                  <span className="hidden text-gray-500 sm:inline">
                    day{user.streak !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
