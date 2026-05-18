import { Container, Graphics } from 'pixi.js';

export interface ParticleSprite {
  x: number;
  y: number;
  radius: number;
  color: number;
  alpha: number;
}

export const createParticleLayer = (particles: ParticleSprite[], glowMultiplier = 3): Container => {
  const layer = new Container();
  layer.blendMode = 'add';

  particles.forEach((particle) => {
    const aura = new Graphics();
    aura.circle(particle.x, particle.y, particle.radius * glowMultiplier).fill({
      color: particle.color,
      alpha: particle.alpha * 0.12,
    });
    layer.addChild(aura);

    const spark = new Graphics();
    spark.circle(particle.x, particle.y, particle.radius).fill({ color: particle.color, alpha: particle.alpha });
    layer.addChild(spark);
  });

  return layer;
};
