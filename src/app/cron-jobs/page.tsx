"use client";

import { api } from "@/trpc/react";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  Calendar,
  Timer,
} from "lucide-react";
import { useRouter } from "next/navigation";

const getStatusDisplay = (status: string | null) => {
  switch (status) {
    case "success":
      return {
        label: "Success",
        color: "text-green-600",
        bgColor: "bg-green-100",
        icon: <CheckCircle className="h-4 w-4" />,
      };
    case "failed":
      return {
        label: "Failed",
        color: "text-red-600",
        bgColor: "bg-red-100",
        icon: <XCircle className="h-4 w-4" />,
      };
    case "warning":
      return {
        label: "Warning",
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
        icon: <AlertTriangle className="h-4 w-4" />,
      };
    case null:
      return {
        label: "Running",
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        icon: <Play className="h-4 w-4" />,
      };
    default:
      return {
        label: "Unknown",
        color: "text-gray-600",
        bgColor: "bg-gray-100",
        icon: <AlertTriangle className="h-4 w-4" />,
      };
  }
};

const formatDate = (date: Date | null) => {
  if (!date) return "N/A";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (date: Date | null) => {
  if (!date) return "N/A";
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const formatDuration = (ms: number) => {
  if (ms === 0) return "0s";
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds.toFixed(1)}s`;
};

export default function CronJobsPage() {
  const { data: cronStatuses } = api.cron.getCronStatuses.useQuery();
  const router = useRouter();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 p-2 sm:space-y-6 sm:p-4">
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
            <Clock className="h-6 w-6 text-blue-500 sm:h-8 sm:w-8" />
            Cron Job History
          </h1>
          <p className="text-sm text-gray-600 sm:text-base">
            Monitor and track all executed cron jobs and their performance
          </p>
        </div>
      </div>

      {/* Statistics */}
      {/* Cron Jobs List */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-4 sm:p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold sm:text-xl">
            <Calendar className="h-5 w-5 text-gray-500" />
            Recent Executions
          </h2>
        </div>
        <div className="p-2 sm:p-6">
          {/* Desktop Table Header */}
          <div className="hidden gap-4 border-b border-gray-100 p-3 text-sm font-medium text-gray-500 sm:grid sm:grid-cols-4">
            <div>Status</div>
            <div>Date</div>
            <div>Time</div>
            <div>Duration</div>
          </div>

          {/* Job List */}
          <div className="space-y-2 sm:space-y-1">
            {cronStatuses
              ?.sort((a, b) => {
                if (!a.createdAt && !b.createdAt) return 0;
                if (!a.createdAt) return 1;
                if (!b.createdAt) return -1;
                return (
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
                );
              })
              .map((job) => {
                const statusInfo = getStatusDisplay(job.status);

                return (
                  <div
                    key={job.id}
                    className="rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50 sm:p-4"
                  >
                    {/* Mobile Layout */}
                    <div className="space-y-2 sm:hidden">
                      <div className="flex items-center justify-between">
                        <div
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}
                        >
                          {statusInfo.icon}
                          <span className="ml-1">{statusInfo.label}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Timer className="h-3 w-3" />
                          {formatDuration(job.timeTaken)}
                        </div>
                      </div>
                      <div className="flex items-center justify-center text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(job.createdAt)} at{" "}
                          {formatTime(job.createdAt)}
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden items-center gap-4 sm:grid sm:grid-cols-4">
                      <div>
                        <div
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}
                        >
                          {statusInfo.icon}
                          <span className="ml-1">{statusInfo.label}</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatDate(job.createdAt)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatTime(job.createdAt)}
                      </div>
                      <div className="text-sm font-medium text-gray-600">
                        {formatDuration(job.timeTaken)}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {cronStatuses?.length === 0 && (
            <div className="py-8 text-center">
              <Clock className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                No cron jobs found
              </h3>
              <p className="text-gray-500">
                Cron job executions will appear here once they start running.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Performance Insights */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-4 sm:p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold sm:text-xl">
            <Timer className="h-5 w-5 text-purple-500" />
            Performance Insights
          </h2>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h3 className="mb-2 font-semibold text-blue-800">
                Average Duration
              </h3>
              <div className="text-2xl font-bold text-blue-600">
                {formatDuration(
                  (cronStatuses ?? []).reduce(
                    (sum, job) => sum + job.timeTaken,
                    0,
                  ) / ((cronStatuses ?? []).length || 1),
                )}
              </div>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <h3 className="mb-2 font-semibold text-green-800">
                Success Rate
              </h3>
              <div className="text-2xl font-bold text-green-600">
                {Math.round(
                  ((cronStatuses ?? []).filter(
                    (job) => job.status === "success",
                  ).length /
                    ((cronStatuses ?? []).length || 1)) *
                    100,
                )}
                %
              </div>
            </div>
            <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
              <h3 className="mb-2 font-semibold text-purple-800">
                Longest Job
              </h3>
              <div className="text-2xl font-bold text-purple-600">
                {formatDuration(
                  Math.max(...(cronStatuses ?? []).map((job) => job.timeTaken)),
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
