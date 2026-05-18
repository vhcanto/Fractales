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

export const renderNuxVomicaPremium = ({ input, width, height, random }: PremiumGeneratorContext): Container => {
  const root = new Container();
  const center: Point = { x: width / 2, y: height / 2 };
  const radius = Math.min(width, height) * 0.43;
  const palette = {
    blue: hslToHex({ hue: 221, saturation: 100, lightness: 58 }),
    cyan: hslToHex({ hue: 186, saturation: 100, lightness: 64 }),
    white: hslToHex({ hue: 200, saturation: 100, lightness: 96 }),
    indigo: hslToHex({ hue: 246, saturation: 90, lightness: 48 }),
  };

  root.addChild(createBackgroundLayer({ width, height, baseHue: 222, accentHue: 184, random, intensity: 1.18 }));
  root.addChild(
    createGlowLayer([
      { ...center, radius: radius * 0.5, color: palette.blue, alpha: 0.16 },
      { ...center, radius: radius * 0.25, color: palette.cyan, alpha: 0.2 },
      { ...center, radius: radius * 0.08, color: palette.white, alpha: 0.34 },
    ], 16),
  );

  const strokes: BranchStroke[] = [];
  const particles: ParticleSprite[] = [];
  const trunks = 30 + Math.round(input.visualParameters.branches * 1.6);

  for (let trunk = 0; trunk < trunks; trunk += 1) {
    let angle = (Math.PI * 2 * trunk) / trunks + randomBetween(random, -0.12, 0.12);
    let current = { ...center };
    const points: Point[] = [current];
    const totalSteps = 12 + Math.floor(random() * 12);
    const segmentLength = radius * randomBetween(random, 0.035, 0.075);

    for (let step = 0; step < totalSteps; step += 1) {
      angle += randomSign(random) * randomBetween(random, 0.18, 0.58);
      current = polarToPoint(current, angle, segmentLength * randomBetween(random, 0.78, 1.45));
      points.push(current);

      if (random() > 0.52) {
        const forkAngle = angle + randomSign(random) * randomBetween(random, 0.7, 1.28);
        const forkMid = polarToPoint(current, forkAngle, segmentLength * randomBetween(random, 0.7, 1.2));
        const forkEnd = polarToPoint(forkMid, forkAngle + randomSign(random) * randomBetween(random, 0.2, 0.55), segmentLength);
        strokes.push({
          points: [current, forkMid, forkEnd],
          color: random() > 0.42 ? palette.cyan : palette.blue,
          alpha: randomBetween(random, 0.24, 0.72),
          width: randomBetween(random, 0.45, 2.15),
        });

        if (random() > 0.65) {
          particles.push({
            x: forkEnd.x,
            y: forkEnd.y,
            radius: randomBetween(random, 0.75, 2.4),
            color: palette.white,
            alpha: randomBetween(random, 0.42, 0.92),
          });
        }
      }
    }

    strokes.push({
      points,
      color: trunk % 6 === 0 ? palette.white : trunk % 2 === 0 ? palette.cyan : palette.indigo,
      alpha: randomBetween(random, 0.28, 0.8),
      width: randomBetween(random, 0.55, 3.1),
    });
  }

  for (let index = 0; index < 300; index += 1) {
    const angle = randomBetween(random, 0, Math.PI * 2);
    const point = polarToPoint(center, angle, radius * randomBetween(random, 0.12, 1.08));
    particles.push({
      x: point.x + randomBetween(random, -10, 10),
      y: point.y + randomBetween(random, -10, 10),
      radius: randomBetween(random, 0.35, 1.9),
      color: random() > 0.52 ? palette.cyan : palette.blue,
      alpha: randomBetween(random, 0.16, 0.72),
    });
  }

  root.addChild(createBranchLayer(strokes, 6.5));
  root.addChild(createParticleLayer(particles, 3.8));
  return root;
};
