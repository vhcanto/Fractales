import { Container } from 'pixi.js';
import type { FractalRenderInput } from '../../../../types/fractal';
import { createBackgroundLayer } from '../layers/backgroundLayer';
import { createBranchLayer, type BranchStroke } from '../layers/branchLayer';
import { createGlowLayer } from '../layers/glowLayer';
import { createParticleLayer, type ParticleSprite } from '../layers/particleLayer';
import { hslToHex } from '../utils/colorUtils';
import { polarToPoint, type Point } from '../utils/geometryUtils';
import { randomBetween, randomSign, type RandomFn } from '../utils/randomUtils';

interface PremiumGeneratorContext {
  input: FractalRenderInput;
  width: number;
  height: number;
  random: RandomFn;
}

export const renderAconitumPremium = ({ input, width, height, random }: PremiumGeneratorContext): Container => {
  const root = new Container();
  const center: Point = { x: width / 2, y: height / 2 };
  const radius = Math.min(width, height) * 0.44;
  const palette = {
    ember: hslToHex({ hue: 28, saturation: 100, lightness: 58 }),
    red: hslToHex({ hue: 6, saturation: 98, lightness: 53 }),
    gold: hslToHex({ hue: 48, saturation: 100, lightness: 68 }),
    white: hslToHex({ hue: 54, saturation: 100, lightness: 93 }),
  };

  root.addChild(createBackgroundLayer({ width, height, baseHue: 12, accentHue: 45, random, intensity: 1.35 }));
  root.addChild(
    createGlowLayer([
      { ...center, radius: radius * 0.52, color: palette.red, alpha: 0.18 },
      { ...center, radius: radius * 0.3, color: palette.gold, alpha: 0.24 },
      { ...center, radius: radius * 0.12, color: palette.white, alpha: 0.42 },
    ], 18),
  );

  const strokes: BranchStroke[] = [];
  const particles: ParticleSprite[] = [];
  const rays = 52 + Math.round(input.visualParameters.density / 8);

  for (let ray = 0; ray < rays; ray += 1) {
    const angle = (Math.PI * 2 * ray) / rays + randomBetween(random, -0.08, 0.08);
    const length = radius * randomBetween(random, 0.48, 1.12);
    const segments = 7 + Math.floor(random() * 7);
    const points: Point[] = [center];
    let currentAngle = angle;

    for (let step = 1; step <= segments; step += 1) {
      const progress = step / segments;
      currentAngle += randomBetween(random, -0.16, 0.16) * (1.2 - progress);
      const jitter = randomBetween(random, -radius * 0.035, radius * 0.035);
      points.push(polarToPoint(center, currentAngle, length * progress + jitter));

      if (step > 2 && random() > 0.42) {
        const branchStart = points[points.length - 1] as Point;
        const branchAngle = currentAngle + randomSign(random) * randomBetween(random, 0.28, 0.72);
        const branchLength = length * randomBetween(random, 0.08, 0.24) * (1 - progress * 0.35);
        strokes.push({
          points: [branchStart, polarToPoint(branchStart, branchAngle, branchLength * 0.5), polarToPoint(branchStart, branchAngle, branchLength)],
          color: random() > 0.55 ? palette.gold : palette.ember,
          alpha: randomBetween(random, 0.24, 0.72),
          width: randomBetween(random, 0.55, 2.8) * (1 - progress * 0.35),
        });
      }
    }

    strokes.push({
      points,
      color: ray % 5 === 0 ? palette.white : ray % 2 === 0 ? palette.ember : palette.red,
      alpha: randomBetween(random, 0.28, 0.82),
      width: randomBetween(random, 0.65, 3.9) * (ray % 5 === 0 ? 1.4 : 1),
    });
  }

  for (let index = 0; index < 440; index += 1) {
    const angle = randomBetween(random, 0, Math.PI * 2);
    const particleRadius = radius * Math.pow(random(), 0.48) * randomBetween(random, 0.12, 1.12);
    const point = polarToPoint(center, angle + Math.sin(particleRadius) * 0.04, particleRadius);
    particles.push({
      x: point.x,
      y: point.y,
      radius: randomBetween(random, 0.45, 2.4) * (1 - particleRadius / (radius * 1.4)),
      color: random() > 0.62 ? palette.gold : palette.ember,
      alpha: randomBetween(random, 0.22, 0.86),
    });
  }

  root.addChild(createBranchLayer(strokes, 7));
  root.addChild(createParticleLayer(particles, 4));
  return root;
};
