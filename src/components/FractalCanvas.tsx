import { useEffect, useRef, useState } from 'react';
import { renderFractal } from '../lib/fractalEngine';
import type { FractalRenderInput } from '../types/fractal';

interface FractalCanvasProps {
  renderInput: FractalRenderInput;
  onRendererError?: () => void;
}

export function FractalCanvas({ renderInput, onRendererError }: FractalCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const parent = canvas.parentElement;
      const width = Math.max(Math.floor(parent?.getBoundingClientRect().width || parent?.clientWidth || 900), 320);
      const height = Math.max(420, Math.min(width * 0.68, 680));
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      renderFractal(canvas, renderInput);
      window.setTimeout(() => setHasError(false), 0);
    } catch (error) {
      console.error('No fue posible iniciar el fallback básico Canvas.', error);
      window.setTimeout(() => setHasError(true), 0);
      onRendererError?.();
    }
  }, [onRendererError, renderInput]);

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/80 p-3 shadow-2xl shadow-cyan-950/30">
      <div className="mb-3 inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-slate-100">
        Fallback Canvas
      </div>
      {hasError ? (
        <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-rose-300/30 bg-rose-950/30 p-6 text-center text-rose-100">
          No se pudo cargar el render fractal. Revisa consola.
        </div>
      ) : (
        <canvas ref={canvasRef} className="min-h-[420px] w-full rounded-2xl" aria-label="Canvas fractal generado" />
      )}
    </div>
  );
}
