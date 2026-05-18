export type EscapeTimeFractalType = 'mandelbrot' | 'julia' | 'burningShip';

export interface EscapeTimePreset {
  id: string;
  name: string;
  description: string;
  remedyId?: string;
  fractalType: EscapeTimeFractalType;
  centerX: number;
  centerY: number;
  zoom: number;
  maxIterations: number;
  escapeRadius: number;
  colorPalette: string;
  colorShift: number;
  contrast: number;
  brightness: number;
  gamma: number;
  rotation?: number;
  juliaC?: { x: number; y: number };
}

export const escapeTimePresets: EscapeTimePreset[] = [
  {
    id: 'aconitum-burning-rupture',
    name: 'Aconitum · ruptura incandescente',
    description: 'Burning Ship con ruptura luminosa, alto contraste y bordes explosivos rojo/naranja.',
    remedyId: 'aconitum',
    fractalType: 'burningShip',
    centerX: -1.765,
    centerY: -0.028,
    zoom: 88,
    maxIterations: 900,
    escapeRadius: 12,
    colorPalette: 'aconitum-incandescente',
    colorShift: 0.14,
    contrast: 1.42,
    brightness: 1.12,
    gamma: 0.82,
    rotation: -0.05,
  },
  {
    id: 'pulsatilla-julia-spiral',
    name: 'Pulsatilla · espiral orgánica lila',
    description: 'Julia Set espiralado, curvas delicadas y profundidad violeta/rosa de transición suave.',
    remedyId: 'pulsatilla',
    fractalType: 'julia',
    centerX: 0,
    centerY: 0,
    zoom: 1.42,
    maxIterations: 720,
    escapeRadius: 8,
    colorPalette: 'pulsatilla-aurora',
    colorShift: 0.36,
    contrast: 1.12,
    brightness: 1.08,
    gamma: 0.9,
    rotation: 0.22,
    juliaC: { x: -0.7269, y: 0.1889 },
  },
  {
    id: 'nux-mandelbrot-electric',
    name: 'Nux vomica · filamento eléctrico',
    description: 'Mandelbrot profundo con filamentos cyan, detalle nervioso y bordes cortantes.',
    remedyId: 'nux-vomica',
    fractalType: 'mandelbrot',
    centerX: -0.743643887,
    centerY: 0.131825904,
    zoom: 2600,
    maxIterations: 1200,
    escapeRadius: 16,
    colorPalette: 'nux-electrico',
    colorShift: 0.58,
    contrast: 1.55,
    brightness: 1.05,
    gamma: 0.74,
    rotation: 0.03,
  },
  {
    id: 'mandelbrot-premium-valley',
    name: 'Mandelbrot premium · valle profundo',
    description: 'Preset genérico premium con alta densidad visual, color continuo y profundidad integrada.',
    fractalType: 'mandelbrot',
    centerX: -0.7453,
    centerY: 0.1127,
    zoom: 820,
    maxIterations: 850,
    escapeRadius: 12,
    colorPalette: 'mandelbrot-premium',
    colorShift: 0.22,
    contrast: 1.28,
    brightness: 1.03,
    gamma: 0.86,
    rotation: -0.02,
  },
];

export const fallbackEscapeTimePreset = escapeTimePresets.find((preset) => preset.id === 'mandelbrot-premium-valley') ?? (escapeTimePresets[0] as EscapeTimePreset);

export const getEscapeTimePresetByRemedyId = (remedyId: string): EscapeTimePreset => {
  return escapeTimePresets.find((preset) => preset.remedyId === remedyId) ?? fallbackEscapeTimePreset;
};

export const getEscapeTimePresetById = (presetId: string): EscapeTimePreset => {
  return escapeTimePresets.find((preset) => preset.id === presetId) ?? fallbackEscapeTimePreset;
};

export const fractalTypeLabels: Record<EscapeTimeFractalType, string> = {
  mandelbrot: 'Mandelbrot',
  julia: 'Julia Set',
  burningShip: 'Burning Ship',
};
