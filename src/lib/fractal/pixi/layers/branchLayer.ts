import { Container, Graphics } from 'pixi.js';
import type { Point } from '../utils/geometryUtils';

export interface BranchStroke {
  points: Point[];
  color: number;
  alpha: number;
  width: number;
}

export const createBranchLayer = (strokes: BranchStroke[], glowScale = 1): Container => {
  const layer = new Container();

  strokes.forEach((stroke) => {
    if (stroke.points.length < 2) return;

    if (glowScale > 1) {
      const glow = new Graphics();
      const start = stroke.points[0];
      if (!start) return;
      const rest = stroke.points.slice(1);
      glow.moveTo(start.x, start.y);
      rest.forEach((point) => glow.lineTo(point.x, point.y));
      glow.stroke({ color: stroke.color, alpha: stroke.alpha * 0.18, width: stroke.width * glowScale });
      glow.blendMode = 'add';
      layer.addChild(glow);
    }

    const line = new Graphics();
    const start = stroke.points[0];
    if (!start) return;
    const rest = stroke.points.slice(1);
    line.moveTo(start.x, start.y);
    rest.forEach((point) => line.lineTo(point.x, point.y));
    line.stroke({ color: stroke.color, alpha: stroke.alpha, width: stroke.width });
    line.blendMode = 'add';
    layer.addChild(line);
  });

  return layer;
};
