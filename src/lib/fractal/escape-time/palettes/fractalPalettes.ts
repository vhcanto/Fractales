export interface FractalPalette {
  id: string;
  name: string;
  colors: Array<[number, number, number]>;
}

export const fractalPalettes: FractalPalette[] = [
  {
    id: 'deep-cyan-gold',
    name: 'Azul profundo · cyan · oro',
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
    name: 'Violeta · lila · rosa · blanco',
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
    name: 'Brasa oscura · naranja · dorado',
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
