export interface HslColor {
  hue: number;
  saturation: number;
  lightness: number;
}

const hueToRgb = (p: number, q: number, t: number): number => {
  let normalized = t;
  if (normalized < 0) normalized += 1;
  if (normalized > 1) normalized -= 1;
  if (normalized < 1 / 6) return p + (q - p) * 6 * normalized;
  if (normalized < 1 / 2) return q;
  if (normalized < 2 / 3) return p + (q - p) * (2 / 3 - normalized) * 6;
  return p;
};

export const hslToHex = ({ hue, saturation, lightness }: HslColor): number => {
  const h = (((hue % 360) + 360) % 360) / 360;
  const s = Math.min(Math.max(saturation, 0), 100) / 100;
  const l = Math.min(Math.max(lightness, 0), 100) / 100;

  if (s === 0) {
    const gray = Math.round(l * 255);
    return (gray << 16) + (gray << 8) + gray;
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = Math.round(hueToRgb(p, q, h + 1 / 3) * 255);
  const g = Math.round(hueToRgb(p, q, h) * 255);
  const b = Math.round(hueToRgb(p, q, h - 1 / 3) * 255);

  return (r << 16) + (g << 8) + b;
};

export const blendHues = (from: number, to: number, progress: number): number => {
  const shortest = ((((to - from) % 360) + 540) % 360) - 180;
  return (from + shortest * progress + 360) % 360;
};
