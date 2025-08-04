import { google } from "googleapis";
import { env } from "@/env";
import {
  buildNameUsernameMap,
  generateCronLogs,
  getOrInsertUserIds,
  getUserDataMapByType,
  parseDates,
  parseUsernames,
  updateLogs,
  updatePointsFreezeStreak,
} from "../utils/log-helpers";

export const runCronJob = async () => {
  // Authenticate with Google Sheets API and fetch Mellowship Sheets Data
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

  // 1 read 2 write git
  // 1 reads 2 write tasks
  // 1 read 1 write standup
  // 3 reads 5 updates/write

  // retrieve data from the first three sheets
  // Commit Box, Github, Weekly StandUp
  const TasksRowData = res.data.sheets?.[0]?.data?.[0]?.rowData ?? [];
  const GithubData = res.data.sheets?.[1]?.data?.[0]?.rowData ?? [];
  const MeetingRowData = res.data.sheets?.[2]?.data?.[0]?.rowData ?? [];

  // [SHEET INDEX MAPS]
  // Map<string,number> name -> index (number)
  const usernames = parseUsernames(TasksRowData, "row", 1);
  const meetingUsernames = parseUsernames(MeetingRowData, "column", 0);
  // Map<string,number> date -> index (number)
  const TaskDates = parseDates(TasksRowData, "column", 0);
  const meetingDates = parseDates(MeetingRowData, "row", 0);

  // [ GITHUB USERNAME MAP]
  // Map<string,string> name -> username
  const usernameMap = buildNameUsernameMap(GithubData);
  //ADD USERNAMES TO DB 1st db read and 2 writes can happen here
  const userIds = await getOrInsertUserIds(usernameMap);

  // create log array for tasks and meetings

  // 1db read to get username to lastlogdate MAP happens Map<string, Date>

  const taskDbRead = await getUserDataMapByType("task");

  if (!taskDbRead) {
    throw new Error("Failed to fetch user data for tasks");
  } else {
    if (taskDbRead instanceof Map) {
      console.log(`✅ Fetched user data for tasks. (${taskDbRead.size} users)`);
    } else {
      console.log("✅ Fetched user data for tasks.");
    }
  }

  const taskLogsToInsert = await generateCronLogs(
    TasksRowData,
    usernames,
    TaskDates,
    userIds,
    "task",
    taskDbRead,
  );

  const meetingDbRead = await getUserDataMapByType("meeting");
  const meetingLogsToInsert = await generateCronLogs(
    MeetingRowData,
    meetingUsernames,
    meetingDates,
    userIds,
    "meeting",
    meetingDbRead,
  );

  // userIds -> 1st db read  , meeting and task another 2 db Reads
  if (taskLogsToInsert.length > 0) {
    // update streak w/o depending on logs

    // 1 db write happens in task for logs and points
    const [updatedLogs, userMap] = await updateLogs([
      ...taskLogsToInsert,
      ...meetingLogsToInsert,
    ]);

    if (taskDbRead instanceof Map) {
      // one whole db write happens here
      await updatePointsFreezeStreak(taskDbRead, taskLogsToInsert, userMap);
    }
    console.log(
      `✅ Inserted ${updatedLogs} logs from ${taskLogsToInsert.length + meetingLogsToInsert.length}.`,
    );
  } else {
    console.log("ℹ️ No logs to insert.");
  }
};
