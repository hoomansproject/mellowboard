export enum Color {
  Green = "green",
  Orange = "orange",
  Red = "red",
  Transparent = "transparent",
  Unknown = "unknown",
}

export function getStatusColor(color: {
  red?: number;
  green?: number;
  blue?: number;
}): Color {
  if (!color.red && !color.green && !color.blue) {
    return Color.Transparent;
  }

  const r = Math.round((color.red ?? 0) * 255);
  const g = Math.round((color.green ?? 0) * 255);
  const b = Math.round((color.blue ?? 0) * 255);

  // Define your RGB references
  const COLORS = {
    red: { r: 255, g: 66, b: 66 },
    orange: { r: 255, g: 187, b: 0 },
    green: { r: 102, g: 255, b: 102 },
  };

  const isClose = (a: number, b: number, tolerance = 30) =>
    Math.abs(a - b) <= tolerance;

  const matches = (target: { r: number; g: number; b: number }) =>
    isClose(r, target.r) && isClose(g, target.g) && isClose(b, target.b);

  // Check against known colors
  if (matches(COLORS.red)) return Color.Red;
  if (matches(COLORS.orange)) return Color.Orange;
  if (matches(COLORS.green)) return Color.Green;

  // Check if it's white-ish or undefined
  if (r > 240 && g > 240 && b > 240) return Color.Transparent;

  return Color.Unknown; // fallback
}
