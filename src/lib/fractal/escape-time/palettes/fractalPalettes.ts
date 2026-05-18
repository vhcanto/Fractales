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
      [0.004, 0.007, 0.02],
      [0.012, 0.032, 0.095],
      [0.025, 0.095, 0.24],
      [0.0, 0.34, 0.58],
      [0.12, 0.72, 0.86],
      [0.78, 0.72, 0.36],
      [1.0, 0.82, 0.34],
      [0.98, 0.98, 0.86],
    ],
  },
  {
    id: 'violet-rose-white',
    name: 'Violeta · lila · rosa · blanco',
    colors: [
      [0.01, 0.006, 0.035],
      [0.055, 0.025, 0.16],
      [0.16, 0.07, 0.35],
      [0.36, 0.16, 0.64],
      [0.68, 0.35, 0.86],
      [0.95, 0.52, 0.78],
      [1.0, 0.76, 0.92],
      [0.98, 0.98, 1.0],
    ],
  },
  {
    id: 'ember-gold-dark',
    name: 'Brasa oscura · naranja · dorado',
    colors: [
      [0.012, 0.006, 0.004],
      [0.06, 0.018, 0.006],
      [0.16, 0.045, 0.01],
      [0.42, 0.12, 0.025],
      [0.74, 0.28, 0.055],
      [0.98, 0.58, 0.16],
      [1.0, 0.78, 0.36],
      [1.0, 0.93, 0.68],
    ],
  },
];

export const getFractalPalette = (paletteId: string): FractalPalette => {
  return fractalPalettes.find((palette) => palette.id === paletteId) ?? (fractalPalettes[0] as FractalPalette);
};
