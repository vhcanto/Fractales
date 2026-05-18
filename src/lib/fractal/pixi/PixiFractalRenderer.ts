import type { Application, Container } from 'pixi.js';
import type { FractalRenderInput } from '../../../types/fractal';
import { renderAconitumPremium } from './generators/aconitumPremium';
import { renderNuxVomicaPremium } from './generators/nuxVomicaPremium';
import { renderPulsatillaPremium } from './generators/pulsatillaPremium';
import { createSeededRandom } from './utils/randomUtils';

type PremiumGenerator = (context: {
  input: FractalRenderInput;
  width: number;
  height: number;
  random: ReturnType<typeof createSeededRandom>;
}) => Container;

const normalizeRemedyName = (name: string): string =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-');

const premiumGenerators: Record<string, PremiumGenerator> = {
  aconitum: renderAconitumPremium,
  pulsatilla: renderPulsatillaPremium,
  'nux-vomica': renderNuxVomicaPremium,
};

export const hasPremiumFractal = (remedyName: string): boolean => normalizeRemedyName(remedyName) in premiumGenerators;

export class PixiFractalRenderer {
  constructor(private readonly app: Application) {}

  render(input: FractalRenderInput, width: number, height: number): void {
    this.clear();

    const generator = premiumGenerators[normalizeRemedyName(input.remedyName)];
    if (!generator) return;

    const random = createSeededRandom(`${input.remedyName}-${input.preset.id}-${width}x${height}`);
    const scene = generator({ input, width, height, random });
    this.app.stage.addChild(scene);
  }

  clear(): void {
    const removedChildren = this.app.stage.removeChildren();
    removedChildren.forEach((child: Container) => child.destroy({ children: true }));
  }

  destroy(): void {
    this.clear();
  }
}
