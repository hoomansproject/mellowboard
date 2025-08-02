import { google } from "googleapis";
import { env } from "@/env";
import {
  buildNameUsernameMap,
  generateCronLogs,
  getOrInsertUserIds,
  parseDates,
  parseUsernames,
  updateLogs,
} from "../utils/log-helpers";

export const runCronJob = async () => {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: env.GOOGLE_CLIENT_EMAIL,
      private_key: env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.get({
    spreadsheetId: env.SHEET_ID,
    includeGridData: true,
    ranges: ["Commit Box!A1:Z100", "Github!A1:Z100", "Weekly StandUp!A1:Z100"],
  });

  const TasksRowData = res.data.sheets?.[0]?.data?.[0]?.rowData ?? [];
  const GithubData = res.data.sheets?.[1]?.data?.[0]?.rowData ?? [];
  const MeetingRowData = res.data.sheets?.[2]?.data?.[0]?.rowData ?? [];

  const usernames = parseUsernames(TasksRowData, "row", 1);
  const meetingUsernames = parseUsernames(MeetingRowData, "column", 0);

  const githubNames = parseUsernames(GithubData, "column", 0);
  const githubUsernames = parseUsernames(GithubData, "column", 1);

  const usernameMap = buildNameUsernameMap(githubNames, githubUsernames);

  const meetingDates = parseDates(MeetingRowData, "row", 0);
  const TaskDates = parseDates(TasksRowData, "column", 0);

  const userIds = await getOrInsertUserIds(
    usernames.concat(meetingUsernames),
    usernameMap,
  );

  const taskLogsToInsert = await generateCronLogs(
    TasksRowData,
    usernames,
    TaskDates,
    userIds,
    "task",
  );
  const meetingLogsToInsert = await generateCronLogs(
    MeetingRowData,
    meetingUsernames,
    meetingDates,
    userIds,
    "meeting",
  );

  if (taskLogsToInsert.length > 0) {
    const updatedTaskLogs = await updateLogs(taskLogsToInsert);
    const updatedMeetingLogs = await updateLogs(meetingLogsToInsert);
    console.log(`✅ Inserted ${updatedTaskLogs} task logs from ${taskLogsToInsert.length}. 
      ✅ Inserted ${updatedMeetingLogs} meeting logs from ${meetingLogsToInsert.length}.
      `);
  } else {
    console.log("ℹ️ No logs to insert.");
  }
};
