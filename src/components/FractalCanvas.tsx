import { useEffect, useRef } from 'react';
import { renderFractal } from '../lib/fractalEngine';
import type { FractalRenderInput } from '../types/fractal';

interface FractalCanvasProps {
  renderInput: FractalRenderInput;
}

export function FractalCanvas({ renderInput }: FractalCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    const width = parent?.clientWidth ?? 900;
    const height = Math.max(420, Math.min(width * 0.68, 680));
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    renderFractal(canvas, renderInput);
  }, [renderInput]);

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/80 p-3 shadow-2xl shadow-cyan-950/30">
      <canvas ref={canvasRef} className="min-h-[420px] w-full rounded-2xl" aria-label="Canvas fractal generado" />
    </div>
  );
}
