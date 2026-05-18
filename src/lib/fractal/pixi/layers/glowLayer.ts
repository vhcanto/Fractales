import { BlurFilter, Container, Graphics } from 'pixi.js';

interface GlowOrb {
  x: number;
  y: number;
  radius: number;
  color: number;
  alpha: number;
}

export const createGlowLayer = (orbs: GlowOrb[], blur = 14): Container => {
  const layer = new Container();
  layer.blendMode = 'add';
  layer.filters = [new BlurFilter({ strength: blur, quality: 5 })];

  orbs.forEach((orb) => {
    const glow = new Graphics();
    glow.circle(orb.x, orb.y, orb.radius).fill({ color: orb.color, alpha: orb.alpha });
    layer.addChild(glow);
  });

  return layer;
};
