import { google } from "googleapis";
import { env } from "@/env";
import {
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
    ranges: ["Commit Box!A1:Z100"],
  });

  const rowData = res.data.sheets?.[0]?.data?.[0]?.rowData ?? [];

  const usernames = parseUsernames(rowData);
  const dates = parseDates(rowData);
  const userIds = await getOrInsertUserIds(usernames);

  const logsToInsert = await generateCronLogs(
    rowData,
    usernames,
    dates,
    userIds,
  );

  if (logsToInsert.length > 0) {
    const updatedLogs = await updateLogs(logsToInsert);
    console.log(`✅ Inserted ${updatedLogs} logs.`);
  } else {
    console.log("ℹ️ No logs to insert.");
  }
};
