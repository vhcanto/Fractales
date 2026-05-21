export interface FractalPalette {
  id: string;
  name: string;
  colors: Array<[number, number, number]>;
}

export const fractalPalettes: FractalPalette[] = [
  {
    id: 'nebula-hdr',
    name: 'Nebula HDR',
    colors: [[0.002, 0.003, 0.015], [0.015, 0.02, 0.11], [0.12, 0.06, 0.28], [0.33, 0.14, 0.57], [0.56, 0.25, 0.82], [0.84, 0.43, 0.88], [0.97, 0.68, 0.92], [0.95, 0.94, 0.99]],
  },
  {
    id: 'cold-space-hdr',
    name: 'Cold Space HDR',
    colors: [[0.001, 0.008, 0.02], [0.004, 0.04, 0.12], [0.01, 0.13, 0.26], [0.03, 0.25, 0.44], [0.19, 0.48, 0.68], [0.45, 0.73, 0.86], [0.78, 0.89, 0.96], [0.96, 0.98, 1.0]],
  },
  {
    id: 'deep-ocean-hdr',
    name: 'Deep Ocean HDR',
    colors: [[0.002, 0.01, 0.018], [0.0, 0.045, 0.084], [0.0, 0.11, 0.19], [0.0, 0.24, 0.31], [0.04, 0.41, 0.5], [0.18, 0.63, 0.67], [0.45, 0.8, 0.8], [0.89, 0.98, 0.97]],
  },
  {
    id: 'plasma-cinematic',
    name: 'Plasma Cinematic',
    colors: [[0.01, 0.0, 0.03], [0.08, 0.0, 0.16], [0.2, 0.02, 0.34], [0.43, 0.05, 0.56], [0.72, 0.12, 0.62], [0.93, 0.3, 0.45], [0.99, 0.57, 0.29], [1.0, 0.88, 0.58]],
  },
  {
    id: 'monochrome-math',
    name: 'Monochrome Mathematical',
    colors: [[0.0, 0.0, 0.0], [0.05, 0.05, 0.06], [0.12, 0.12, 0.14], [0.22, 0.24, 0.27], [0.38, 0.4, 0.43], [0.58, 0.61, 0.64], [0.8, 0.83, 0.86], [0.98, 0.99, 1.0]],
  },
  {
    id: 'deep-cyan-gold',
    name: 'Deep Space Blue',
    colors: [
      [0.003, 0.006, 0.018],
      [0.01, 0.027, 0.082],
      [0.018, 0.085, 0.22],
      [0.0, 0.31, 0.54],
      [0.1, 0.68, 0.82],
      [0.62, 0.63, 0.34],
      [0.94, 0.72, 0.29],
      [0.92, 0.94, 0.78],
    ],
  },
  {
    id: 'violet-rose-white',
    name: 'Quantum Violet',
    colors: [
      [0.008, 0.005, 0.032],
      [0.045, 0.02, 0.14],
      [0.14, 0.055, 0.33],
      [0.34, 0.13, 0.62],
      [0.62, 0.28, 0.82],
      [0.9, 0.45, 0.74],
      [0.98, 0.68, 0.88],
      [0.94, 0.92, 0.98],
    ],
  },
  {
    id: 'ember-gold-dark',
    name: 'Nebula Gold',
    colors: [
      [0.012, 0.007, 0.005],
      [0.048, 0.022, 0.012],
      [0.12, 0.052, 0.024],
      [0.32, 0.102, 0.036],
      [0.62, 0.2, 0.055],
      [0.88, 0.42, 0.12],
      [0.96, 0.66, 0.28],
      [0.82, 0.75, 0.58],
    ],
  },
];

export const getFractalPalette = (paletteId: string): FractalPalette => {
  return fractalPalettes.find((palette) => palette.id === paletteId) ?? (fractalPalettes[0] as FractalPalette);
};
