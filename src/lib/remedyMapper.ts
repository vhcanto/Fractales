import type { FractalPreset, VisualFractalParams } from '../types/fractal';
import type { Remedy } from '../types/remedy';

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);
const normalize = (value: number): number => clamp(value, 0, 100) / 100;
const mapRange = (value: number, min: number, max: number): number => min + normalize(value) * (max - min);

export const mapRemedyToVisualParams = (remedy: Remedy, preset: FractalPreset): VisualFractalParams => {
  const { energia, dispersion, repeticion, inestabilidad, densidad, simetria } = remedy.parameters;
  const hueShift = energia * 0.8 + dispersion * 0.5 - inestabilidad * 0.25;
  const hue = Math.round((preset.baseHue + hueShift) % 360);

  return {
    hue,
    secondaryHue: Math.round((hue + mapRange(simetria, 72, 168)) % 360),
    branches: Math.round(mapRange(simetria, 5, 14)),
    layers: Math.round(mapRange(repeticion, 5, 18)),
    radius: Math.round(mapRange(energia, 120, 260) * preset.scaleFactor),
    lineWidth: Number(mapRange(densidad, 0.6, 3.8).toFixed(2)),
    rotation: Number((mapRange(repeticion, 0.005, 0.055) * preset.rotationFactor).toFixed(4)),
    noise: Number(mapRange(inestabilidad + dispersion / 2, 0.01, 0.42).toFixed(3)),
    alpha: Number(mapRange(energia, 0.36, 0.88).toFixed(2)),
    density: Math.round(mapRange(densidad, 80, 340)),
  };
};

export const pickRandomItem = <T>(items: readonly T[]): T => {
  if (items.length === 0) {
    throw new Error('No hay elementos disponibles para seleccionar.');
  }

  const item = items[Math.floor(Math.random() * items.length)];
  if (item === undefined) {
    throw new Error('No fue posible seleccionar un elemento aleatorio.');
  }

  return item;
};
