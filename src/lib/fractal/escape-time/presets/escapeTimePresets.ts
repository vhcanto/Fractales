export type EscapeTimeFractalType = 'mandelbrot' | 'julia' | 'burningShip';

export interface FractalCameraState {
  centerX: number;
  centerY: number;
  zoom: number;
  rotation?: number;
  initialCenterX: number;
  initialCenterY: number;
  initialZoom: number;
}

export interface EscapeTimePreset extends FractalCameraState {
  id: string;
  name: string;
  description: string;
  fractalType: EscapeTimeFractalType;
  equation: string;
  maxIterations: number;
  escapeRadius: number;
  colorPalette: string;
  colorShift: number;
  contrast: number;
  brightness: number;
  gamma: number;
  juliaC?: { x: number; y: number };
}

const withInitialCamera = <T extends Omit<EscapeTimePreset, 'initialCenterX' | 'initialCenterY' | 'initialZoom'>>(preset: T): EscapeTimePreset => ({
  ...preset,
  initialCenterX: preset.centerX,
  initialCenterY: preset.centerY,
  initialZoom: preset.zoom,
});

export const escapeTimePresets: EscapeTimePreset[] = [
  withInitialCamera({
    id: 'mandelbrot',
    name: 'Mandelbrot',
    description: 'Valle profundo con bordes espirales, cyan y oro sobre fondo azul nocturno.',
    fractalType: 'mandelbrot',
    equation: 'zₙ₊₁ = zₙ² + c',
    centerX: -0.743643887037151,
    centerY: 0.13182590420533,
    zoom: 1850,
    maxIterations: 1200,
    escapeRadius: 16,
    colorPalette: 'deep-cyan-gold',
    colorShift: 0.18,
    contrast: 1.22,
    brightness: 1.03,
    gamma: 0.86,
    rotation: 0.015,
  }),
  withInitialCamera({
    id: 'julia',
    name: 'Julia Set',
    description: 'Julia espiralado y simétrico con violetas, lilas, rosa y blancos suaves.',
    fractalType: 'julia',
    equation: 'zₙ₊₁ = zₙ² + k',
    centerX: 0,
    centerY: 0,
    zoom: 1.28,
    maxIterations: 900,
    escapeRadius: 8,
    colorPalette: 'violet-rose-white',
    colorShift: 0.32,
    contrast: 1.08,
    brightness: 1.08,
    gamma: 0.9,
    rotation: 0.18,
    juliaC: { x: -0.7269, y: 0.1889 },
  }),
  withInitialCamera({
    id: 'burning-ship',
    name: 'Burning Ship',
    description: 'Zona reconocible del Burning Ship con estructura clara, dorados y naranjas equilibrados.',
    fractalType: 'burningShip',
    equation: 'zₙ₊₁ = (|Re(zₙ)| + i|Im(zₙ)|)² + c',
    centerX: -1.7552,
    centerY: -0.0318,
    zoom: 58,
    maxIterations: 1100,
    escapeRadius: 16,
    colorPalette: 'ember-gold-dark',
    colorShift: 0.08,
    contrast: 1.16,
    brightness: 0.98,
    gamma: 0.92,
    rotation: 0,
  }),
];

export const fallbackEscapeTimePreset = escapeTimePresets[0] as EscapeTimePreset;

export const getEscapeTimePresetByType = (fractalType: EscapeTimeFractalType): EscapeTimePreset => {
  return escapeTimePresets.find((preset) => preset.fractalType === fractalType) ?? fallbackEscapeTimePreset;
};

export const getEscapeTimePresetById = (presetId: string): EscapeTimePreset => {
  return escapeTimePresets.find((preset) => preset.id === presetId) ?? fallbackEscapeTimePreset;
};

export const fractalTypeLabels: Record<EscapeTimeFractalType, string> = {
  mandelbrot: 'Mandelbrot',
  julia: 'Julia Set',
  burningShip: 'Burning Ship',
};
