import { Container, Graphics } from 'pixi.js';
import { hslToHex } from '../utils/colorUtils';
import { randomBetween, type RandomFn } from '../utils/randomUtils';

interface BackgroundLayerOptions {
  width: number;
  height: number;
  baseHue: number;
  accentHue: number;
  random: RandomFn;
  intensity?: number;
}

export const createBackgroundLayer = ({
  width,
  height,
  baseHue,
  accentHue,
  random,
  intensity = 1,
}: BackgroundLayerOptions): Container => {
  const layer = new Container();
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.hypot(width, height) / 2;

  const base = new Graphics();
  base.rect(0, 0, width, height).fill({ color: 0x020617, alpha: 1 });
  layer.addChild(base);

  for (let index = 0; index < 18; index += 1) {
    const progress = index / 17;
    const radius = maxRadius * (1 - progress * 0.92);
    const color = hslToHex({
      hue: progress > 0.55 ? accentHue : baseHue,
      saturation: 88 - progress * 18,
      lightness: 8 + progress * 34,
    });
    const halo = new Graphics();
    halo.circle(centerX, centerY, radius).fill({ color, alpha: (0.018 + progress * 0.03) * intensity });
    halo.blendMode = 'add';
    layer.addChild(halo);
  }

  for (let index = 0; index < 130; index += 1) {
    const mote = new Graphics();
    const x = randomBetween(random, 0, width);
    const y = randomBetween(random, 0, height);
    const size = randomBetween(random, 0.35, 1.55);
    const color = hslToHex({ hue: random() > 0.5 ? baseHue : accentHue, saturation: 72, lightness: 72 });
    mote.circle(x, y, size).fill({ color, alpha: randomBetween(random, 0.025, 0.1) });
    mote.blendMode = 'add';
    layer.addChild(mote);
  }

  return layer;
};
