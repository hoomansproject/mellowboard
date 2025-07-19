import { google } from "googleapis";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "@/env";
import * as schema from "./schema"; // your Drizzle schema

async function main() {
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
  const rowMetadata = res.data.sheets?.[0]?.data?.[0]?.rowMetadata ?? {};
  const columnMetadata = res.data.sheets?.[0]?.data?.[0]?.columnMetadata ?? {};

  // if (rows.length < 2) return console.warn("No data found in sheet.");

  // const headers = rows[1];
  // const dataRows = rows.slice(1);

  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  const db = drizzle(pool, { schema });

  // for (const cols of dataRows) {
  // }

  const usernames = rowData[1]?.values?.map((v,idx) => ({colIndex: idx, name: v.formattedValue})).filter((v) => v.name?.trim() !== ""  && v.name) ?? [];
  const dates = rowData.map((row,idx) => ({rowIndex: idx, date: row.values?.[0]?.formattedValue})).filter((v) => v.date?.trim() !== ""  && v.date) ?? [];
  console.log(usernames,dates);
  // console.log(rowData[0]?.values?.[1]);

  console.log(rowData[30]?.values?.[10]?.formattedValue);

  console.log(rowData[30]?.values?.[10]?.effectiveFormat);

  console.log("✅ Seeded data from Google Sheets");
  await pool.end();
}

main().catch((e) => {
  console.error("Failed to seed:", e);
  process.exit(1);
});
