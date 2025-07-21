import type { LogStatus } from "../db/enums/log";
import { Color } from "./color";
import { getUserStreak } from "./log-helpers";

const STATUS_REGEX =
  /\[\s*(DONE|NO\s*TASK|NOT\s*AVAILABLE|FREEZE[-\s]?CARD|FC)\s*\]/i;

export function calculateSeedPoints(text: string, color: Color): number {
  const normalizedText = text.trim();

  // 1️⃣ If color is green → 1 point
  if (color === Color.Green) return 1;
  // 2️⃣ If text includes "[DONE]" in various formats → 1 point
  const match = STATUS_REGEX.exec(normalizedText);

  if (match && match[1]?.replace(/\s+/g, " ").toUpperCase() === "DONE") {
    return 1;
  }

  // 3️⃣ If color is orange or red → 0 point
  if (color === Color.Orange || color === Color.Red) return 0;

  // 4️⃣ If text indicates no work or unavailability → 0 point
  if (match) {
    const status = match[1]?.replace(/\s+/g, " ").toUpperCase();
    if (status === "NO TASK" || status === "NOT AVAILABLE") {
      return 0;
    }
  }

  // 5️⃣ Default: 0 points
  return 0;
}

export async function calculateCronPoints(
  userId: string,
  text: string,
  color: Color,
): Promise<number> {
  const streak = await getUserStreak(userId, 11);
  const seedPoints = calculateSeedPoints(text, color);

  if (streak > 10) return seedPoints * 4;
  if (streak > 5) return seedPoints * 3;
  if (streak > 0) return seedPoints * 2;

  return seedPoints;
}

export function getStatusFromTextAndColor(
  text: string,
  color: Color,
): LogStatus {
  const normalizedText = text.trim();
  const match = STATUS_REGEX.exec(normalizedText);
  const status = match?.[1]?.replace(/\s+/g, " ").toUpperCase();

  if (status === "FREEZE CARD" || status === "FC" || status === "FREEZE-CARD")
    return "freeze_card";

  // ✅ If green or DONE → worked
  if (color === Color.Green) return "worked";
  if (status === "DONE") return "worked";

  // 🚫 If orange/No task → no_task
  if (color === Color.Orange || status === "NO TASK") return "no_task";

  // ❄️ If red / NOT AVAILABLE → not_avaialble
  if (color === Color.Red || status === "NOT AVAILABLE") return "not_available";

  // 💤 If totally empty and no relevant color, fallback to absent
  return "not_available";
}
