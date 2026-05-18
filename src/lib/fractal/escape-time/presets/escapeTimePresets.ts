export type EscapeTimeFractalType = 'mandelbrot' | 'julia' | 'burningShip';
export type EscapeTimeViewKind = 'full' | 'deep';
export type RenderStage = 'preview' | 'refinando' | 'final';

export interface FractalCameraState {
  centerX: number;
  centerY: number;
  zoom: number;
  rotation?: number;
  initialCenterX: number;
  initialCenterY: number;
  initialZoom: number;
  minZoom: number;
  maxZoom: number;
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
  renderStage: RenderStage;
  samples: number;
}

const DEFAULT_MIN_ZOOM = 0.08;
const DEFAULT_MAX_ZOOM = 100_000_000_000_000;

export const RENDER_STAGE_DELAYS = {
  mediumMs: 190,
  finalMs: 560,
} as const;

const withInitialCamera = <T extends Omit<EscapeTimePreset, keyof Pick<FractalCameraState, 'initialCenterX' | 'initialCenterY' | 'initialZoom' | 'minZoom' | 'maxZoom'>> & Partial<Pick<FractalCameraState, 'minZoom' | 'maxZoom'>>>(preset: T): EscapeTimePreset => ({
  ...preset,
  initialCenterX: preset.centerX,
  initialCenterY: preset.centerY,
  initialZoom: preset.zoom,
  minZoom: preset.minZoom ?? DEFAULT_MIN_ZOOM,
  maxZoom: preset.maxZoom ?? DEFAULT_MAX_ZOOM,
});

const basePresetByType: Record<EscapeTimeFractalType, Omit<EscapeTimePreset, keyof FractalCameraState | 'id' | 'name' | 'description'>> = {
  mandelbrot: {
    fractalType: 'mandelbrot',
    equation: 'zₙ₊₁ = zₙ² + c',
    maxIterations: 800,
    escapeRadius: 32,
    colorPalette: 'deep-cyan-gold',
    colorShift: 0.12,
    contrast: 1.12,
    brightness: 1.04,
    gamma: 0.92,
    renderStage: 'final',
    samples: 4,
  },
  julia: {
    fractalType: 'julia',
    equation: 'zₙ₊₁ = zₙ² + k',
    maxIterations: 800,
    escapeRadius: 16,
    colorPalette: 'violet-rose-white',
    colorShift: 0.32,
    contrast: 1.08,
    brightness: 1.08,
    gamma: 0.9,
    juliaC: { x: -0.7269, y: 0.1889 },
    renderStage: 'final',
    samples: 4,
  },
  burningShip: {
    fractalType: 'burningShip',
    equation: 'zₙ₊₁ = (|Re(zₙ)| + i|Im(zₙ)|)² + c',
    maxIterations: 800,
    escapeRadius: 32,
    colorPalette: 'ember-gold-dark',
    colorShift: 0.08,
    contrast: 1.14,
    brightness: 0.98,
    gamma: 0.94,
    renderStage: 'final',
    samples: 4,
  },
};

export const escapeTimeViewPresets: EscapeTimePreset[] = [
  withInitialCamera({
    ...basePresetByType.mandelbrot,
    id: 'mandelbrot-full',
    name: 'Mandelbrot: vista general',
    description: 'Vista completa del conjunto Mandelbrot para orientarse antes de navegar a zonas profundas.',
    centerX: -0.5,
    centerY: 0,
    zoom: 0.92,
    rotation: 0,
  }),
  withInitialCamera({
    ...basePresetByType.mandelbrot,
    id: 'mandelbrot-deep-spiral',
    name: 'Mandelbrot: zona espiral profunda',
    description: 'Valle Seahorse con filamentos espirales y profundidad alta para exploración detallada.',
    centerX: -0.743643887037151,
    centerY: 0.13182590420533,
    zoom: 1850,
    maxIterations: 1200,
    escapeRadius: 32,
    colorShift: 0.18,
    contrast: 1.22,
    brightness: 1.03,
    gamma: 0.86,
    rotation: 0.015,
  }),
  withInitialCamera({
    ...basePresetByType.julia,
    id: 'julia-full',
    name: 'Julia Set: vista completa',
    description: 'Vista completa del Julia Set para ubicar los lóbulos principales y la simetría global.',
    centerX: 0,
    centerY: 0,
    zoom: 1.28,
    rotation: 0.18,
  }),
  withInitialCamera({
    ...basePresetByType.julia,
    id: 'julia-detail',
    name: 'Julia Set: zona detalle',
    description: 'Acercamiento a una antena espiralada del Julia Set con contraste suave y filamentos brillantes.',
    centerX: -0.095,
    centerY: 0.655,
    zoom: 165,
    maxIterations: 1200,
    colorShift: 0.42,
    contrast: 1.16,
    brightness: 1.06,
    gamma: 0.86,
    rotation: 0.18,
  }),
  withInitialCamera({
    ...basePresetByType.burningShip,
    id: 'burning-ship-full',
    name: 'Burning Ship: vista general corregida',
    description: 'Encuadre amplio y corregido del Burning Ship con el casco completo y antenas visibles.',
    centerX: -0.52,
    centerY: -0.54,
    zoom: 1.05,
    rotation: 0,
  }),
  withInitialCamera({
    ...basePresetByType.burningShip,
    id: 'burning-ship-deep',
    name: 'Burning Ship: zona profunda estética',
    description: 'Zona profunda estética con arcos dorados, chimeneas y textura fina cerca del valle principal.',
    centerX: -1.7552,
    centerY: -0.0318,
    zoom: 58,
    maxIterations: 1100,
    colorShift: 0.08,
    contrast: 1.16,
    brightness: 0.98,
    gamma: 0.92,
    rotation: 0,
  }),
];

export const escapeTimePresets = escapeTimeViewPresets.filter((preset) => preset.id.endsWith('full'));

export const fallbackEscapeTimePreset = escapeTimeViewPresets[0] as EscapeTimePreset;

export const getEscapeTimePresetByType = (fractalType: EscapeTimeFractalType, view: EscapeTimeViewKind = 'full'): EscapeTimePreset => {
  const matcher = view === 'deep' ? (preset: EscapeTimePreset) => preset.fractalType === fractalType && !preset.id.endsWith('full') : (preset: EscapeTimePreset) => preset.fractalType === fractalType && preset.id.endsWith('full');
  return escapeTimeViewPresets.find(matcher) ?? fallbackEscapeTimePreset;
};

export const getEscapeTimePresetById = (presetId: string): EscapeTimePreset => {
  return escapeTimeViewPresets.find((preset) => preset.id === presetId) ?? fallbackEscapeTimePreset;
};

export const fractalTypeLabels: Record<EscapeTimeFractalType, string> = {
  mandelbrot: 'Mandelbrot',
  julia: 'Julia Set',
  burningShip: 'Burning Ship',
};

export const getDepthLevel = (zoom: number): string => {
  if (zoom < 8) return 'Nivel 1: vista general';
  if (zoom < 250) return 'Nivel 2: acercamiento';
  if (zoom < 8_000) return 'Nivel 3: detalle';
  if (zoom < 300_000) return 'Nivel 4: profundo';
  return 'Nivel 5: muy profundo';
};

export const getAdaptiveIterations = (zoom: number, fractalType: EscapeTimeFractalType): number => {
  const safeZoom = Math.max(zoom, 0.0001);
  const depth = Math.max(Math.log10(Math.max(safeZoom, 1)), 0);
  const base = safeZoom < 25 ? 820 : safeZoom < 1_000 ? 1350 : safeZoom < 80_000 ? 2300 : safeZoom < 4_000_000 ? 3500 : 4650;
  const offset = safeZoom < 25
    ? (fractalType === 'mandelbrot' ? 120 : fractalType === 'julia' ? -40 : -130)
    : (fractalType === 'mandelbrot' ? 320 : fractalType === 'julia' ? -120 : -320);
  const adjusted = base + offset + Math.round(depth * 42);
  const minimum = fractalType === 'burningShip' ? 620 : 680;
  const maximum = fractalType === 'mandelbrot' ? 5000 : fractalType === 'julia' ? 4500 : 3900;
  return Math.min(maximum, Math.max(minimum, adjusted));
};

export const getPreviewIterations = (zoom: number, fractalType: EscapeTimeFractalType): number => {
  const finalIterations = getAdaptiveIterations(zoom, fractalType);
  const floor = fractalType === 'burningShip' ? 300 : 340;
  return Math.max(floor, Math.round(finalIterations * 0.3));
};

export const getMediumIterations = (zoom: number, fractalType: EscapeTimeFractalType): number => {
  const finalIterations = getAdaptiveIterations(zoom, fractalType);
  const floor = fractalType === 'burningShip' ? 460 : 520;
  return Math.max(floor, Math.round(finalIterations * 0.62));
};

export const getAdaptiveSamples = (stage: RenderStage, pixelCount: number, zoom: number): number => {
  if (stage === 'preview') return 1;

  const isLargeSurface = pixelCount > 2_600_000;
  const isVeryLargeSurface = pixelCount > 4_400_000;
  const isDeepZoom = zoom > 2_000_000;

  if (stage === 'refinando') return isVeryLargeSurface ? 1 : 2;
  if (isVeryLargeSurface || (isLargeSurface && isDeepZoom)) return 2;
  if (isLargeSurface) return 3;
  return 4;
};

export const applyRenderStageQuality = (preset: EscapeTimePreset, stage: RenderStage, pixelCount = 1_000_000): EscapeTimePreset => {
  const iterations = stage === 'preview'
    ? getPreviewIterations(preset.zoom, preset.fractalType)
    : stage === 'refinando'
      ? getMediumIterations(preset.zoom, preset.fractalType)
      : getAdaptiveIterations(preset.zoom, preset.fractalType);

  return {
    ...preset,
    maxIterations: iterations,
    samples: getAdaptiveSamples(stage, pixelCount, preset.zoom),
    renderStage: stage,
  };
};

export const tunePresetForZoom = (preset: EscapeTimePreset): EscapeTimePreset => {
  const depth = Math.max(Math.log10(Math.max(preset.zoom, 1)), 0);
  const visualBase = basePresetByType[preset.fractalType];
  const contrast = Math.min(1.42, visualBase.contrast + depth * 0.02);
  const gamma = Math.max(0.7, visualBase.gamma - depth * 0.017);
  const brightness = Math.min(1.13, visualBase.brightness + depth * 0.007);
  const tuned: EscapeTimePreset = {
    ...preset,
    contrast,
    gamma,
    brightness,
  };

  return applyRenderStageQuality(tuned, preset.renderStage ?? 'final');
};
