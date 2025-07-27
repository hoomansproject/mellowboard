"use client";

import {
  ArrowLeft,
  Trophy,
  Star,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Calendar,
  Flame,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function RulesPage() {
  const router = useRouter();

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

      {/* Title */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-4 text-center sm:p-6">
          <h1 className="mb-2 flex items-center justify-center gap-2 text-2xl font-bold sm:text-3xl">
            <Trophy className="h-6 w-6 text-yellow-500 sm:h-8 sm:w-8" />
            Mellows Point System & Rules
          </h1>
          <p className="text-sm text-gray-600 sm:text-base">
            Understanding how Mellows earn points through daily tasks and weekly
            meetings
          </p>
        </div>
      </div>

      {/* Point System Overview */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-4 sm:p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold sm:text-xl">
            <Star className="h-5 w-5 text-yellow-500" />
            Point System Overview
          </h2>
        </div>
        <div className="space-y-4 p-4 sm:p-6">
          <p className="text-sm text-gray-700 sm:text-base">
            As a Mellow, you earn points through daily task completion and
            weekly standup meeting attendance. Your performance and consistency
            directly impact your points and streak bonuses.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h3 className="mb-2 font-semibold text-blue-800">Daily Tasks</h3>
              <p className="text-sm text-blue-700">
                Complete tasks on time to earn points and maintain streaks
              </p>
            </div>
            <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
              <h3 className="mb-2 font-semibold text-purple-800">
                Weekly Meetings
              </h3>
              <p className="text-sm text-purple-700">
                Attend standup meetings for bonus points
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Tasks */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-4 sm:p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold sm:text-xl">
            <CheckCircle className="h-5 w-5 text-blue-500" />
            Daily Tasks
          </h2>
        </div>
        <div className="space-y-4 p-4 sm:p-6">
          <p className="text-sm text-gray-700 sm:text-base">
            Daily tasks are the core of the Mellows system. Points depend on
            when you complete your task and your current streak.
          </p>

          <div className="space-y-3">
            <div className="flex flex-col justify-between gap-2 rounded-lg border border-green-200 bg-green-50 p-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-100 p-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-green-800">
                    Task Completed Same Day
                  </p>
                  <p className="text-sm text-green-700">
                    Completed on the assigned day
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-green-600">
                  +2 points
                </span>
                <p className="text-xs text-green-600">
                  Base points (affected by streak bonus)
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-yellow-100 p-2 text-yellow-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-yellow-800">
                    Task Completed Late
                  </p>
                  <p className="text-sm text-yellow-700">
                    Completed 1+ days after assigned date
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-yellow-600">
                  +1 point
                </span>
                <p className="text-xs text-yellow-600">
                  Reduced points, no streak bonus
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-2 rounded-lg border border-gray-200 bg-gray-50 p-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-gray-100 p-2 text-gray-600">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    No Task Available
                  </p>
                  <p className="text-sm text-gray-700">
                    No task assigned for the day
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-gray-600">
                  0 points
                </span>
                <p className="text-xs text-gray-600">Streak maintained</p>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-2 rounded-lg border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-red-100 p-2 text-red-600">
                  <XCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-red-800">Not Available</p>
                  <p className="text-sm text-red-700">
                    Unable to complete assigned task
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-red-600">0 points</span>
                <p className="text-xs text-red-600">Streak broken</p>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-2 rounded-lg border border-blue-200 bg-blue-50 p-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                  <div className="flex h-5 w-5 items-center justify-center">
                    <span className="text-xs font-bold">🛡️</span>
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-blue-800">
                    Freeze Card Used
                  </p>
                  <p className="text-sm text-blue-700">
                    Protected day using earned freeze card
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-blue-600">
                  0 points
                </span>
                <p className="text-xs text-blue-600">Streak protected</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spreadsheet Instructions */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-4 sm:p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold sm:text-xl">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-green-500">
              <span className="text-xs font-bold text-white">📊</span>
            </div>
            Spreadsheet Filling Instructions
          </h2>
        </div>
        <div className="space-y-4 p-4 sm:p-6">
          <p className="text-sm text-gray-700 sm:text-base">
            Mellows use a shared spreadsheet to log their daily activities.
            Proper formatting is essential for accurate point tracking.
          </p>

          <div className="space-y-3">
            <div
              className="flex flex-col justify-between gap-2 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center"
              style={{ backgroundColor: "#67f15520" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="rounded-full p-2 text-white"
                  style={{ backgroundColor: "#67f155" }}
                >
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Task Completed</p>
                  <p className="text-sm text-gray-700">
                    Use when you&apos;ve finished your assigned task
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="rounded border bg-white p-2 font-mono text-sm">
                  <div style={{ color: "#67f155" }} className="font-bold">
                    [DONE] Task description
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    Color: #67f155
                  </div>
                </div>
              </div>
            </div>

            <div
              className="flex flex-col justify-between gap-2 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center"
              style={{ backgroundColor: "#ff3a3a20" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="rounded-full p-2 text-white"
                  style={{ backgroundColor: "#ff3a3a" }}
                >
                  <XCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Not Available</p>
                  <p className="text-sm text-gray-700">
                    Use when you cannot complete the task
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="rounded border bg-white p-2 font-mono text-sm">
                  <div style={{ color: "#ff3a3a" }} className="font-bold">
                    [NOT AVAILABLE] Reason
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    Color: #ff3a3a
                  </div>
                </div>
              </div>
            </div>

            <div
              className="flex flex-col justify-between gap-2 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center"
              style={{ backgroundColor: "#fbbc0420" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="rounded-full p-2 text-white"
                  style={{ backgroundColor: "#fbbc04" }}
                >
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">No Task</p>
                  <p className="text-sm text-gray-700">
                    Use when no task was assigned
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="rounded border bg-white p-2 font-mono text-sm">
                  <div style={{ color: "#fbbc04" }} className="font-bold">
                    [NO TASK]
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    Color: #fbbc04
                  </div>
                </div>
              </div>
            </div>

            <div
              className="flex flex-col justify-between gap-2 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center"
              style={{ backgroundColor: "#3b82f620" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="rounded-full p-2 text-white"
                  style={{ backgroundColor: "#3b82f6" }}
                >
                  <div className="flex h-5 w-5 items-center justify-center">
                    <span className="text-xs font-bold">🛡️</span>
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Freeze Card</p>
                  <p className="text-sm text-gray-700">
                    Use to protect your streak
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="rounded border bg-white p-2 font-mono text-sm">
                  <div style={{ color: "#3b82f6" }} className="font-bold">
                    [FC] or [FREEZE-CARD]
                  </div>
                  <div className="mt-1 text-xs text-gray-500">Color: Any</div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h3 className="mb-2 font-semibold text-blue-800">
              Important Formatting Rules
            </h3>
            <ul className="space-y-1 text-sm text-blue-700">
              <li>• Always use the exact color codes provided</li>
              <li>
                • Include the prefix in square brackets [DONE], [NOT AVAILABLE],
                etc.
              </li>
              <li>• Add a brief description after [DONE] entries</li>
              <li>• Be consistent with formatting for accurate tracking</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Freeze Card System */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-4 sm:p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold sm:text-xl">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
              <span className="text-xs text-white">🛡️</span>
            </div>
            Freeze Card System
          </h2>
        </div>
        <div className="space-y-4 p-4 sm:p-6">
          <p className="text-sm text-gray-700 sm:text-base">
            Freeze Cards are special protection tools that help Mellows maintain
            their streaks during challenging days.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h3 className="mb-2 font-semibold text-blue-800">How to Earn</h3>
              <p className="text-sm text-blue-700">
                Earn 1 Freeze Card for every 50 points you accumulate
              </p>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <h3 className="mb-2 font-semibold text-green-800">
                How They Work
              </h3>
              <p className="text-sm text-green-700">
                Protects your streak even if you don&apos;t complete a task
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h3 className="mb-2 font-semibold text-blue-800">
                Freeze Card Benefits
              </h3>
              <ul className="space-y-1 text-sm text-blue-700">
                <li>• Maintains your current streak count</li>
                <li>• Gives 0 points for the day (no penalty)</li>
                <li>• Can be used strategically on difficult days</li>
                <li>
                  • Must be declared in the spreadsheet using [FC] or
                  [FREEZE-CARD]
                </li>
              </ul>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <h3 className="mb-2 font-semibold text-amber-800">
                Strategic Usage
              </h3>
              <ul className="space-y-1 text-sm text-amber-700">
                <li>• Save freeze cards for emergencies or planned absences</li>
                <li>
                  • Don&apos;t waste them on days when you could complete tasks
                  late
                </li>
                <li>
                  • Remember: 1 point from late completion is better than 0 from
                  freeze card
                </li>
                <li>
                  • Use when you would otherwise mark &quot;Not Available&quot;
                </li>
              </ul>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="mb-2 font-semibold text-gray-800">
              Example Calculation
            </h3>
            <div className="space-y-1 text-sm text-gray-700">
              <p>• Mellow earns 100 points total → Gets 2 Freeze Cards</p>
              <p>• Mellow earns 175 points total → Gets 3 Freeze Cards</p>
              <p>• Freeze Cards accumulate and can be saved for future use</p>
            </div>
          </div>
        </div>
      </div>

      {/* Streak System */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-4 sm:p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold sm:text-xl">
            <Flame className="h-5 w-5 text-orange-500" />
            Streak Bonus System
          </h2>
        </div>
        <div className="space-y-4 p-4 sm:p-6">
          <p className="text-sm text-gray-700 sm:text-base">
            Maintain consecutive days of completing tasks on time to unlock
            streak bonuses that multiply your daily points.
          </p>

          <div className="space-y-3">
            <div className="flex flex-col justify-between gap-2 rounded-lg border border-blue-200 bg-blue-50 p-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                  <span className="text-sm font-bold">0-4</span>
                </div>
                <div>
                  <p className="font-semibold text-blue-800">Starting Streak</p>
                  <p className="text-sm text-blue-700">
                    Building your consistency
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-blue-600">
                  2 points/day
                </span>
                <p className="text-xs text-blue-600">Base rate</p>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-2 rounded-lg border border-orange-200 bg-orange-50 p-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-orange-100 p-2 text-orange-600">
                  <span className="text-sm font-bold">5+</span>
                </div>
                <div>
                  <p className="font-semibold text-orange-800">Good Streak</p>
                  <p className="text-sm text-orange-700">5+ consecutive days</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-orange-600">
                  3 points/day
                </span>
                <p className="text-xs text-orange-600">+50% bonus</p>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-2 rounded-lg border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-red-100 p-2 text-red-600">
                  <span className="text-sm font-bold">10+</span>
                </div>
                <div>
                  <p className="font-semibold text-red-800">Excellent Streak</p>
                  <p className="text-sm text-red-700">10+ consecutive days</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-red-600">
                  4 points/day
                </span>
                <p className="text-xs text-red-600">+100% bonus</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <h3 className="mb-2 font-semibold text-amber-800">
              Important Notes
            </h3>
            <ul className="space-y-1 text-sm text-amber-700">
              <li>• Streak bonuses only apply to same-day task completions</li>
              <li>
                • Late task completions always give 1 point regardless of streak
              </li>
              <li>
                • &quot;No task&quot; days maintain your streak without breaking
                it
              </li>
              <li>
                • &quot;Not available&quot; status breaks your streak
                immediately
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Weekly Meetings */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-4 sm:p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold sm:text-xl">
            <Users className="h-5 w-5 text-purple-500" />
            Weekly Standup Meetings
          </h2>
        </div>
        <div className="space-y-4 p-4 sm:p-6">
          <p className="text-sm text-gray-700 sm:text-base">
            Weekly standup meetings are crucial for team coordination. Your
            attendance and communication affect your points.
          </p>

          <div className="space-y-3">
            <div className="flex flex-col justify-between gap-2 rounded-lg border border-green-200 bg-green-50 p-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-100 p-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-green-800">
                    Meeting Attended
                  </p>
                  <p className="text-sm text-green-700">
                    Present and participated in standup
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-green-600">
                  +5 points
                </span>
                <p className="text-xs text-green-600">Full attendance bonus</p>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-yellow-100 p-2 text-yellow-600">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-yellow-800">
                    Informed Absence
                  </p>
                  <p className="text-sm text-yellow-700">
                    Notified team in advance about absence
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-yellow-600">
                  +1 point
                </span>
                <p className="text-xs text-yellow-600">Communication bonus</p>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-2 rounded-lg border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-red-100 p-2 text-red-600">
                  <XCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-red-800">No Show</p>
                  <p className="text-sm text-red-700">
                    Missed meeting without prior notice
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-red-600">
                  -6 points
                </span>
                <p className="text-xs text-red-600">
                  Penalty for no communication
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Examples */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-4 sm:p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold sm:text-xl">
            <Calendar className="h-5 w-5 text-indigo-500" />
            Point Calculation Examples
          </h2>
        </div>
        <div className="space-y-4 p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <h3 className="mb-3 font-semibold text-green-800">
                Example 1: Great Week
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">
                    7 days streak, task completed same day
                  </span>
                  <span className="font-semibold text-green-800">+3 pts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">
                    Weekly meeting attended
                  </span>
                  <span className="font-semibold text-green-800">+5 pts</span>
                </div>
                <div className="flex justify-between border-t border-green-200 pt-2 font-bold">
                  <span className="text-green-800">Daily Total:</span>
                  <span className="text-green-800">8 points</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <h3 className="mb-3 font-semibold text-yellow-800">
                Example 2: Mixed Performance
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-yellow-700">
                    Task completed 1 day late
                  </span>
                  <span className="font-semibold text-yellow-800">+1 pt</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-700">
                    Meeting - informed absence
                  </span>
                  <span className="font-semibold text-yellow-800">+1 pt</span>
                </div>
                <div className="flex justify-between border-t border-yellow-200 pt-2 font-bold">
                  <span className="text-yellow-800">Daily Total:</span>
                  <span className="text-yellow-800">2 points</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <h3 className="mb-3 font-semibold text-red-800">
                Example 3: Difficult Day
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-red-700">Not available for task</span>
                  <span className="font-semibold text-red-800">0 pts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-700">Meeting no-show</span>
                  <span className="font-semibold text-red-800">-6 pts</span>
                </div>
                <div className="flex justify-between border-t border-red-200 pt-2 font-bold">
                  <span className="text-red-800">Daily Total:</span>
                  <span className="text-red-800">-6 points</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h3 className="mb-3 font-semibold text-gray-800">
                Example 4: No Task Day
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">No task assigned</span>
                  <span className="font-semibold text-gray-800">0 pts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Meeting attended</span>
                  <span className="font-semibold text-gray-800">+5 pts</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 font-bold">
                  <span className="text-gray-800">Daily Total:</span>
                  <span className="text-gray-800">5 points</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tips for Success */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-4 sm:p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold sm:text-xl">
            <Star className="h-5 w-5 text-green-500" />
            Tips for Mellows Success
          </h2>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <h3 className="font-semibold text-green-700">
                Maximize Your Points
              </h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• Complete tasks on the same day they&apos;re assigned</li>
                <li>• Build and maintain long streaks for bonus points</li>
                <li>• Never miss weekly standup meetings</li>
                <li>• Always communicate if you can&apos;t attend meetings</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-blue-700">
                Protect Your Streak
              </h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• Plan ahead for busy days</li>
                <li>
                  • Remember: &quot;No task&quot; days don&apos;t break streaks
                </li>
                <li>• Avoid &quot;Not available&quot; status when possible</li>
                <li>• Late completion is better than not available</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
