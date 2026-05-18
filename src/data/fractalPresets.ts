import type { FractalPreset } from '../types/fractal';

export const fractalPresets: FractalPreset[] = [
  {
    id: 'neural-spiral',
    name: 'Espiral neural',
    style: 'spiral',
    description: 'Trazos concéntricos que simulan una firma energética en expansión.',
    baseHue: 176,
    rotationFactor: 1.8,
    scaleFactor: 0.92,
    iterations: 260,
  },
  {
    id: 'dendritic-bloom',
    name: 'Floración dendrítica',
    style: 'branch',
    description: 'Ramificaciones simétricas con variaciones orgánicas y profundidad radial.',
    baseHue: 265,
    rotationFactor: 2.4,
    scaleFactor: 0.72,
    iterations: 8,
  },
  {
    id: 'orbital-lattice',
    name: 'Retícula orbital',
    style: 'orbital',
    description: 'Órbitas repetidas y puntos luminosos que forman una matriz circular.',
    baseHue: 38,
    rotationFactor: 1.25,
    scaleFactor: 0.86,
    iterations: 180,
  },
];
