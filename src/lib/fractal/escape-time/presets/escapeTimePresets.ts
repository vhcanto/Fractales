export type EscapeTimeFractalType = 'mandelbrot' | 'julia' | 'burningShip';
export type EscapeTimeViewKind = 'full' | 'deep';
export type RenderStage = 'preview' | 'refining' | 'final';

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
  saturation: number;
  gamma: number;
  juliaC?: { x: number; y: number };
  renderStage: RenderStage;
  samples: number;
  orbitTrapEnabled?: boolean;
  orbitTrapMode?: 'line' | 'circle' | 'glow' | 'field';
  lightingStrength?: number;
  deStrength?: number;
}

const DEFAULT_MIN_ZOOM = 0.08;
const DEFAULT_MAX_ZOOM = 100_000_000_000_000;

export const RENDER_STAGE_DELAYS = {
  mediumMs: 260,
  finalMs: 980,
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
    saturation: 1.08,
    gamma: 0.92,
    renderStage: 'final',
    samples: 4,
    orbitTrapEnabled: true,
    orbitTrapMode: 'field',
    lightingStrength: 0.5,
    deStrength: 0.82,
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
    saturation: 1.06,
    gamma: 0.9,
    juliaC: { x: -0.7269, y: 0.1889 },
    renderStage: 'final',
    samples: 4,
    orbitTrapEnabled: true,
    orbitTrapMode: 'glow',
    lightingStrength: 0.62,
    deStrength: 0.8,
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
    saturation: 1.03,
    gamma: 0.94,
    renderStage: 'final',
    samples: 4,
    orbitTrapEnabled: true,
    orbitTrapMode: 'line',
    lightingStrength: 0.66,
    deStrength: 0.88,
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
    name: 'Julia Set: encuadre exploratorio',
    description: 'Encuadre asimétrico para arrancar exploración orgánica sin aspecto ornamental de logo centrado.',
    centerX: -0.288,
    centerY: 0.174,
    zoom: 2.85,
    rotation: 0.25,
  }),
  withInitialCamera({
    ...basePresetByType.julia,
    id: 'julia-detail',
    name: 'Julia Set: filamentos profundos',
    description: 'Región parcial con filamentos, espirales truncadas y textura densa para exploración profunda.',
    centerX: -0.4124,
    centerY: 0.5872,
    zoom: 410,
    maxIterations: 2200,
    colorShift: 0.48,
    contrast: 1.2,
    brightness: 1.02,
    gamma: 0.82,
    rotation: 0.28,
  }),
  withInitialCamera({
    ...basePresetByType.julia,
    id: 'julia-nebula',
    name: 'Nebula Julia',
    description: 'Preset cinematográfico con filamentos gaseosos y profundidad progresiva.',
    centerX: -0.211,
    centerY: 0.671,
    zoom: 620,
    juliaC: { x: -0.74543, y: 0.11301 },
    maxIterations: 2800,
    colorPalette: 'nebula-hdr',
    colorShift: 0.42,
    contrast: 1.28,
    gamma: 0.78,
    orbitTrapMode: 'glow',
    lightingStrength: 0.72,
    deStrength: 0.88,
  }),
  withInitialCamera({
    ...basePresetByType.julia,
    id: 'julia-spiral',
    name: 'Spiral Julia',
    description: 'Espirales densas con continuidad suave y detalle interno alto.',
    centerX: -0.395,
    centerY: 0.577,
    zoom: 710,
    juliaC: { x: -0.70176, y: -0.3842 },
    maxIterations: 2900,
    colorPalette: 'plasma-cinematic',
    orbitTrapMode: 'line',
    lightingStrength: 0.68,
    deStrength: 0.9,
  }),
  withInitialCamera({
    ...basePresetByType.julia,
    id: 'julia-crystal',
    name: 'Crystal Julia',
    description: 'Estructuras cristalinas de alto contraste con sombreado de relieve.',
    centerX: -0.501,
    centerY: 0.184,
    zoom: 560,
    juliaC: { x: -0.8, y: 0.156 },
    maxIterations: 3000,
    colorPalette: 'cold-space-hdr',
    orbitTrapMode: 'circle',
    lightingStrength: 0.77,
    deStrength: 0.92,
  }),
  withInitialCamera({
    ...basePresetByType.julia,
    id: 'julia-infinite-bloom',
    name: 'Infinite Bloom Julia',
    description: 'Composición orgánica con bloom matemático y gradiente continuo.',
    centerX: -0.354,
    centerY: 0.612,
    zoom: 835,
    juliaC: { x: -0.7269, y: 0.1889 },
    maxIterations: 3200,
    colorPalette: 'deep-ocean-hdr',
    orbitTrapMode: 'field',
    lightingStrength: 0.74,
    deStrength: 0.93,
  }),
  withInitialCamera({
    ...basePresetByType.julia,
    id: 'julia-organic',
    name: 'Organic Julia',
    description: 'Textura orgánica y asimétrica para exploración infinita con alta continuidad.',
    centerX: -0.438,
    centerY: 0.563,
    zoom: 900,
    juliaC: { x: -0.662, y: -0.447 },
    maxIterations: 3400,
    colorPalette: 'monochrome-math',
    orbitTrapMode: 'glow',
    lightingStrength: 0.7,
    deStrength: 0.95,
  }),
  withInitialCamera({
    ...basePresetByType.burningShip,
    id: 'burning-ship-full',
    name: 'Burning Ship: composición base',
    description: 'Composición balanceada con mejor contraste y menos saturación para lectura de estructura.',
    centerX: -0.63,
    centerY: -0.46,
    zoom: 1.62,
    rotation: 0,
  }),
  withInitialCamera({
    ...basePresetByType.burningShip,
    id: 'burning-ship-deep',
    name: 'Burning Ship: zona profunda estética',
    description: 'Región profunda con mejor composición, aristas complejas y menor saturación plana.',
    centerX: -1.74434,
    centerY: -0.01721,
    zoom: 138,
    maxIterations: 1800,
    colorShift: 0.05,
    contrast: 1.22,
    brightness: 0.95,
    saturation: 0.96,
    gamma: 0.9,
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
  const base = safeZoom < 10 ? 800 : safeZoom < 100 ? 1600 : safeZoom < 1000 ? 3200 : safeZoom < 10_000 ? 6400 : 12000;
  const typeBias = fractalType === 'mandelbrot' ? 260 : fractalType === 'julia' ? 120 : -180;
  const deepBoost = safeZoom > 10_000 ? Math.round(depth * 340) : Math.round(depth * 110);
  const adjusted = base + typeBias + deepBoost;
  const minimum = fractalType === 'burningShip' ? 780 : 880;
  const maximum = safeZoom > 3_000_000 ? 16000 : 14000;
  return Math.min(maximum, Math.max(minimum, adjusted));
};

export const getPreviewIterations = (zoom: number, fractalType: EscapeTimeFractalType): number => {
  const finalIterations = getAdaptiveIterations(zoom, fractalType);
  const floor = fractalType === 'burningShip' ? 320 : 380;
  return Math.max(floor, Math.round(finalIterations * 0.24));
};

export const getMediumIterations = (zoom: number, fractalType: EscapeTimeFractalType): number => {
  const finalIterations = getAdaptiveIterations(zoom, fractalType);
  const floor = fractalType === 'burningShip' ? 640 : 760;
  return Math.max(floor, Math.round(finalIterations * 0.56));
};

export const getAdaptiveSamples = (stage: RenderStage, pixelCount: number, zoom: number): number => {
  if (stage === 'preview') return 1;

  const isLargeSurface = pixelCount > 2_600_000;
  const isVeryLargeSurface = pixelCount > 4_400_000;
  const isDeepZoom = zoom > 2_000_000;

  if (stage === 'refining') return isVeryLargeSurface ? 2 : 4;
  if (isVeryLargeSurface || (isLargeSurface && isDeepZoom)) return 4;
  if (isLargeSurface) return 6;
  return 9;
};

export const applyRenderStageQuality = (preset: EscapeTimePreset, stage: RenderStage, pixelCount = 1_000_000): EscapeTimePreset => {
  const iterations = stage === 'preview'
    ? getPreviewIterations(preset.zoom, preset.fractalType)
    : stage === 'refining'
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
  const saturation = Math.min(1.22, visualBase.saturation + depth * 0.016);
  const tuned: EscapeTimePreset = {
    ...preset,
    contrast,
    gamma,
    brightness,
    saturation,
  };

  return applyRenderStageQuality(tuned, preset.renderStage ?? 'final');
};
