import type { RemedyParameters } from './remedy';

export type FractalStyle = 'spiral' | 'branch' | 'orbital';

export interface FractalPreset {
  id: string;
  name: string;
  style: FractalStyle;
  description: string;
  baseHue: number;
  rotationFactor: number;
  scaleFactor: number;
  iterations: number;
}

export interface VisualFractalParams {
  hue: number;
  secondaryHue: number;
  branches: number;
  layers: number;
  radius: number;
  lineWidth: number;
  rotation: number;
  noise: number;
  alpha: number;
  density: number;
}

export interface FractalRenderInput {
  remedyName: string;
  preset: FractalPreset;
  originalParameters: RemedyParameters;
  visualParameters: VisualFractalParams;
}
