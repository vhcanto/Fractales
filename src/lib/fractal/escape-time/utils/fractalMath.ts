import type { EscapeTimePreset } from '../presets/escapeTimePresets';

export const cloneEscapeTimePreset = (preset: EscapeTimePreset): EscapeTimePreset => ({
  ...preset,
  juliaC: preset.juliaC ? { ...preset.juliaC } : undefined,
});

export const withRuntimeOverrides = (
  preset: EscapeTimePreset,
  overrides: { maxIterations?: number; zoom?: number; colorShift?: number },
): EscapeTimePreset => ({
  ...cloneEscapeTimePreset(preset),
  maxIterations: overrides.maxIterations ?? preset.maxIterations,
  zoom: overrides.zoom ?? preset.zoom,
  colorShift: overrides.colorShift ?? preset.colorShift,
});

export const jitterPreset = (preset: EscapeTimePreset): EscapeTimePreset => {
  const phase = Math.random() * Math.PI * 2;
  const centerScale = 1 / Math.max(preset.zoom, 1);

  return {
    ...cloneEscapeTimePreset(preset),
    centerX: preset.centerX + Math.cos(phase) * centerScale * 0.32,
    centerY: preset.centerY + Math.sin(phase * 1.37) * centerScale * 0.32,
    colorShift: (preset.colorShift + 0.08 + Math.random() * 0.24) % 1,
    rotation: (preset.rotation ?? 0) + (Math.random() - 0.5) * 0.08,
  };
};
