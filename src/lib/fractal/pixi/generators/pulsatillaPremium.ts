import { Container } from 'pixi.js';
import type { FractalRenderInput } from '../../../../types/fractal';
import { createBackgroundLayer } from '../layers/backgroundLayer';
import { createBranchLayer, type BranchStroke } from '../layers/branchLayer';
import { createGlowLayer } from '../layers/glowLayer';
import { createParticleLayer, type ParticleSprite } from '../layers/particleLayer';
import { blendHues, hslToHex } from '../utils/colorUtils';
import { cubicBezierPoint, polarToPoint, type Point } from '../utils/geometryUtils';
import { randomBetween, randomSign, type RandomFn } from '../utils/randomUtils';

interface PremiumGeneratorContext {
  input: FractalRenderInput;
  width: number;
  height: number;
  random: RandomFn;
}

const buildCurve = (start: Point, end: Point, controlA: Point, controlB: Point, steps: number): Point[] => {
  const points: Point[] = [];
  for (let index = 0; index <= steps; index += 1) {
    points.push(cubicBezierPoint(start, controlA, controlB, end, index / steps));
  }
  return points;
};

export const renderPulsatillaPremium = ({ input, width, height, random }: PremiumGeneratorContext): Container => {
  const root = new Container();
  const center: Point = { x: width / 2, y: height / 2 };
  const radius = Math.min(width, height) * 0.42;
  const palette = {
    violet: hslToHex({ hue: 278, saturation: 88, lightness: 64 }),
    lilac: hslToHex({ hue: 306, saturation: 78, lightness: 73 }),
    rose: hslToHex({ hue: 334, saturation: 78, lightness: 72 }),
    white: hslToHex({ hue: 318, saturation: 100, lightness: 96 }),
  };

  root.addChild(createBackgroundLayer({ width, height, baseHue: 272, accentHue: 326, random, intensity: 1.08 }));
  root.addChild(
    createGlowLayer([
      { ...center, radius: radius * 0.72, color: palette.violet, alpha: 0.14 },
      { ...center, radius: radius * 0.46, color: palette.lilac, alpha: 0.17 },
      { ...center, radius: radius * 0.18, color: palette.white, alpha: 0.2 },
    ], 24),
  );

  const strokes: BranchStroke[] = [];
  const particles: ParticleSprite[] = [];
  const arms = 13;
  const turns = 2.9 + input.visualParameters.noise * 1.3;

  for (let arm = 0; arm < arms; arm += 1) {
    const baseAngle = (Math.PI * 2 * arm) / arms;
    let previous = center;
    const points: Point[] = [center];

    for (let step = 1; step <= 72; step += 1) {
      const progress = step / 72;
      const wave = Math.sin(progress * Math.PI * 8 + arm) * 0.2;
      const angle = baseAngle + progress * Math.PI * 2 * turns + wave;
      const spiralRadius = radius * progress ** 0.74 * randomBetween(random, 0.985, 1.015);
      const next = polarToPoint(center, angle, spiralRadius);
      points.push(next);

      if (step % 9 === 0) {
        const branchDirection = angle + randomSign(random) * randomBetween(random, 0.55, 1.05);
        const end = polarToPoint(next, branchDirection, radius * randomBetween(random, 0.08, 0.22) * (1 - progress * 0.25));
        const controlA = polarToPoint(previous, branchDirection - 0.55, radius * 0.09);
        const controlB = polarToPoint(end, branchDirection + 0.65, radius * 0.07);
        strokes.push({
          points: buildCurve(next, end, controlA, controlB, 12),
          color: random() > 0.5 ? palette.lilac : palette.rose,
          alpha: randomBetween(random, 0.16, 0.46),
          width: randomBetween(random, 0.45, 1.9) * (1.05 - progress * 0.45),
        });
      }
      previous = next;
    }

    const hue = blendHues(274, 334, arm / arms);
    strokes.push({
      points,
      color: hslToHex({ hue, saturation: 86, lightness: 68 }),
      alpha: 0.32 + (arm % 3) * 0.08,
      width: 1.4 + (arm % 4) * 0.42,
    });
  }

  for (let index = 0; index < 360; index += 1) {
    const progress = random();
    const angle = progress * Math.PI * 2 * turns + randomBetween(random, 0, Math.PI * 2);
    const drift = Math.sin(progress * 18) * radius * 0.08;
    const point = polarToPoint(center, angle, radius * progress ** 0.72 + drift);
    particles.push({
      x: point.x,
      y: point.y,
      radius: randomBetween(random, 0.35, 1.85),
      color: random() > 0.78 ? palette.white : random() > 0.48 ? palette.lilac : palette.rose,
      alpha: randomBetween(random, 0.12, 0.58),
    });
  }

  root.addChild(createBranchLayer(strokes, 5.5));
  root.addChild(createParticleLayer(particles, 3.4));
  return root;
};
