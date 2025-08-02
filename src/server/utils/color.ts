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

  // Reference color definitions
  const COLORS: Record<Color, { r: number; g: number; b: number }> = {
    [Color.Red]: { r: 255, g: 66, b: 66 },
    [Color.Orange]: { r: 255, g: 187, b: 0 },
    [Color.Green]: { r: 102, g: 255, b: 102 },
    [Color.Transparent]: {
      r: 0,
      g: 0,
      b: 0,
    },
    [Color.Unknown]: {
      r: 0,
      g: 0,
      b: 0,
    },
  };

  // Euclidean distance between two RGB colors
  const colorDistance = (
    c1: { r: number; g: number; b: number },
    c2: { r: number; g: number; b: number },
  ) =>
    Math.sqrt(
      Math.pow(c1.r - c2.r, 2) +
        Math.pow(c1.g - c2.g, 2) +
        Math.pow(c1.b - c2.b, 2),
    );

  let closestColor: Color = Color.Unknown;
  let minDistance = Infinity;

  for (const [name, refColor] of Object.entries(COLORS)) {
    const dist = colorDistance({ r, g, b }, refColor);
    if (dist < minDistance) {
      minDistance = dist;
      closestColor = name as Color;
    }
  }

  // If color is very light (white-ish), return transparent
  if (r > 240 && g > 240 && b > 240) {
    return Color.Transparent;
  }

  return closestColor;
}
