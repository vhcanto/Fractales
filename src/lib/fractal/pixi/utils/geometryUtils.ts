export interface Point {
  x: number;
  y: number;
}

export const polarToPoint = (origin: Point, angle: number, radius: number): Point => ({
  x: origin.x + Math.cos(angle) * radius,
  y: origin.y + Math.sin(angle) * radius,
});

export const cubicBezierPoint = (a: Point, b: Point, c: Point, d: Point, t: number): Point => {
  const inverse = 1 - t;
  const x = inverse ** 3 * a.x + 3 * inverse ** 2 * t * b.x + 3 * inverse * t ** 2 * c.x + t ** 3 * d.x;
  const y = inverse ** 3 * a.y + 3 * inverse ** 2 * t * b.y + 3 * inverse * t ** 2 * c.y + t ** 3 * d.y;
  return { x, y };
};

export const midpoint = (a: Point, b: Point): Point => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
export const distance = (a: Point, b: Point): number => Math.hypot(a.x - b.x, a.y - b.y);
