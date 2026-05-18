export interface FractalPalette {
  id: string;
  name: string;
  colors: Array<[number, number, number]>;
}

export const fractalPalettes: FractalPalette[] = [
  {
    id: 'aconitum-incandescente',
    name: 'Aconitum incandescente',
    colors: [
      [0.03, 0.0, 0.0],
      [0.22, 0.02, 0.0],
      [0.62, 0.06, 0.01],
      [0.95, 0.22, 0.02],
      [1.0, 0.55, 0.08],
      [1.0, 0.86, 0.28],
      [1.0, 0.96, 0.72],
      [1.0, 1.0, 1.0],
    ],
  },
  {
    id: 'pulsatilla-aurora',
    name: 'Pulsatilla aurora lila',
    colors: [
      [0.015, 0.01, 0.05],
      [0.09, 0.03, 0.2],
      [0.23, 0.08, 0.45],
      [0.45, 0.16, 0.72],
      [0.75, 0.34, 0.86],
      [0.96, 0.55, 0.78],
      [1.0, 0.78, 0.92],
      [1.0, 1.0, 1.0],
    ],
  },
  {
    id: 'nux-electrico',
    name: 'Nux eléctrico cyan',
    colors: [
      [0.0, 0.01, 0.035],
      [0.0, 0.035, 0.12],
      [0.0, 0.08, 0.34],
      [0.0, 0.22, 0.68],
      [0.0, 0.62, 0.95],
      [0.35, 0.94, 1.0],
      [0.78, 1.0, 1.0],
      [1.0, 1.0, 1.0],
    ],
  },
  {
    id: 'mandelbrot-premium',
    name: 'Mandelbrot premium profundo',
    colors: [
      [0.005, 0.008, 0.025],
      [0.02, 0.04, 0.12],
      [0.07, 0.08, 0.28],
      [0.18, 0.12, 0.45],
      [0.0, 0.48, 0.72],
      [0.34, 0.82, 0.86],
      [0.96, 0.78, 0.36],
      [1.0, 0.98, 0.86],
    ],
  },
];

export const getFractalPalette = (paletteId: string): FractalPalette => {
  return fractalPalettes.find((palette) => palette.id === paletteId) ?? (fractalPalettes[0] as FractalPalette);
};
