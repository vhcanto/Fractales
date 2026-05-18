import type { FractalRenderInput, VisualFractalParams } from '../types/fractal';

const getCanvasCenter = (canvas: HTMLCanvasElement) => ({
  x: canvas.width / 2,
  y: canvas.height / 2,
});

const clearCanvas = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void => {
  const gradient = ctx.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    20,
    canvas.width / 2,
    canvas.height / 2,
    canvas.width / 1.4,
  );
  gradient.addColorStop(0, '#111827');
  gradient.addColorStop(0.55, '#07111f');
  gradient.addColorStop(1, '#020617');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
};

const strokeStyle = (params: VisualFractalParams, alphaOffset = 0): string =>
  `hsla(${params.hue}, 88%, 62%, ${Math.max(params.alpha - alphaOffset, 0.12)})`;

const drawGlowCore = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, params: VisualFractalParams): void => {
  const { x, y } = getCanvasCenter(canvas);
  const glow = ctx.createRadialGradient(x, y, 0, x, y, params.radius * 0.55);
  glow.addColorStop(0, `hsla(${params.secondaryHue}, 95%, 72%, 0.32)`);
  glow.addColorStop(0.45, `hsla(${params.hue}, 90%, 54%, 0.12)`);
  glow.addColorStop(1, 'rgba(2, 6, 23, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, params.radius * 0.8, 0, Math.PI * 2);
  ctx.fill();
};

const drawSpiral = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, input: FractalRenderInput): void => {
  const { visualParameters: params, preset } = input;
  const center = getCanvasCenter(canvas);

  ctx.save();
  ctx.translate(center.x, center.y);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (let branch = 0; branch < params.branches; branch += 1) {
    const branchAngle = (Math.PI * 2 * branch) / params.branches;
    ctx.beginPath();
    for (let i = 0; i < preset.iterations; i += 1) {
      const progress = i / preset.iterations;
      const radius = progress * params.radius;
      const wave = Math.sin(progress * params.layers * Math.PI * 2 + branchAngle) * params.noise * 30;
      const angle = branchAngle + i * params.rotation + wave * 0.01;
      const x = Math.cos(angle) * (radius + wave);
      const y = Math.sin(angle) * (radius + wave);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.strokeStyle = branch % 2 === 0 ? strokeStyle(params, 0.08) : `hsla(${params.secondaryHue}, 86%, 68%, 0.58)`;
    ctx.lineWidth = params.lineWidth;
    ctx.stroke();
  }

  ctx.restore();
};

const drawBranch = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, input: FractalRenderInput): void => {
  const { visualParameters: params, preset } = input;
  const center = getCanvasCenter(canvas);
  const drawRecursiveBranch = (x: number, y: number, length: number, angle: number, depth: number): void => {
    if (depth <= 0 || length < 3) return;

    const instability = Math.sin(depth * 12.9898 + angle * 78.233) * params.noise;
    const nextX = x + Math.cos(angle + instability) * length;
    const nextY = y + Math.sin(angle + instability) * length;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(nextX, nextY);
    ctx.strokeStyle = `hsla(${(params.hue + depth * 9) % 360}, 90%, ${58 + depth * 2}%, ${0.18 + depth * 0.08})`;
    ctx.lineWidth = Math.max(params.lineWidth * (depth / preset.iterations), 0.35);
    ctx.stroke();

    const spread = Math.PI / (3.2 + params.branches / 10);
    drawRecursiveBranch(nextX, nextY, length * preset.scaleFactor, angle - spread, depth - 1);
    drawRecursiveBranch(nextX, nextY, length * preset.scaleFactor, angle + spread, depth - 1);

    if (depth % 2 === 0) {
      drawRecursiveBranch(nextX, nextY, length * (preset.scaleFactor - 0.1), angle, depth - 2);
    }
  };

  ctx.save();
  ctx.lineCap = 'round';
  for (let branch = 0; branch < params.branches; branch += 1) {
    drawRecursiveBranch(
      center.x,
      center.y,
      params.radius * 0.24,
      (Math.PI * 2 * branch) / params.branches - Math.PI / 2,
      preset.iterations,
    );
  }
  ctx.restore();
};

const drawOrbital = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, input: FractalRenderInput): void => {
  const { visualParameters: params, preset } = input;
  const center = getCanvasCenter(canvas);

  ctx.save();
  ctx.translate(center.x, center.y);

  for (let layer = 1; layer <= params.layers; layer += 1) {
    const progress = layer / params.layers;
    const radius = params.radius * progress;
    ctx.beginPath();
    ctx.ellipse(0, 0, radius, radius * (0.62 + params.noise), layer * params.rotation, 0, Math.PI * 2);
    ctx.strokeStyle = `hsla(${(params.hue + layer * 7) % 360}, 82%, 62%, ${0.1 + progress * 0.35})`;
    ctx.lineWidth = Math.max(params.lineWidth * (1 - progress * 0.55), 0.4);
    ctx.stroke();
  }

  for (let i = 0; i < params.density; i += 1) {
    const progress = i / params.density;
    const angle = i * preset.rotationFactor * 2.399963 + Math.sin(i) * params.noise;
    const radius = params.radius * Math.sqrt(progress);
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius * (0.72 + params.noise * 0.5);
    const size = 1 + Math.sin(i * 0.7) * 0.8 + params.lineWidth * 0.45;

    ctx.beginPath();
    ctx.fillStyle = `hsla(${i % 3 === 0 ? params.secondaryHue : params.hue}, 95%, 70%, ${0.35 + progress * 0.5})`;
    ctx.arc(x, y, Math.max(size, 0.7), 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
};

export const renderFractal = (canvas: HTMLCanvasElement, input: FractalRenderInput): void => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  clearCanvas(ctx, canvas);
  drawGlowCore(ctx, canvas, input.visualParameters);

  if (input.preset.style === 'spiral') {
    drawSpiral(ctx, canvas, input);
  }

  if (input.preset.style === 'branch') {
    drawBranch(ctx, canvas, input);
  }

  if (input.preset.style === 'orbital') {
    drawOrbital(ctx, canvas, input);
  }
};
