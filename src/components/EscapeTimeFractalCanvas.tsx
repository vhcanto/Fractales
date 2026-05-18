import { useEffect, useRef } from 'react';
import { EscapeTimeFractalRenderer } from '../lib/fractal/escape-time/EscapeTimeFractalRenderer';
import type { EscapeTimePreset } from '../lib/fractal/escape-time/presets/escapeTimePresets';

interface EscapeTimeFractalCanvasProps {
  preset: EscapeTimePreset;
  onRendererError?: () => void;
}

export function EscapeTimeFractalCanvas({ preset, onRendererError }: EscapeTimeFractalCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<EscapeTimeFractalRenderer | null>(null);
  const latestPresetRef = useRef(preset);
  const onRendererErrorRef = useRef(onRendererError);

  useEffect(() => {
    latestPresetRef.current = preset;
  }, [preset]);

  useEffect(() => {
    onRendererErrorRef.current = onRendererError;
  }, [onRendererError]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const host = canvas.parentElement;
    let resizeObserver: ResizeObserver | null = null;
    let frame = 0;

    const renderCurrentPreset = () => {
      if (!host || !rendererRef.current) return;
      const width = Math.max(host.clientWidth, 320);
      const height = Math.max(440, Math.min(width * 0.68, 760));
      rendererRef.current.resize(width, height);
      rendererRef.current.render(latestPresetRef.current);
    };

    try {
      rendererRef.current = new EscapeTimeFractalRenderer(canvas);
      resizeObserver = new ResizeObserver(() => {
        window.cancelAnimationFrame(frame);
        frame = window.requestAnimationFrame(renderCurrentPreset);
      });
      if (host) resizeObserver.observe(host);
      renderCurrentPreset();
    } catch (error) {
      console.error('No fue posible iniciar el render matemático WebGL.', error);
      onRendererErrorRef.current?.();
    }

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      rendererRef.current?.destroy();
      rendererRef.current = null;
    };
  }, []);

  useEffect(() => {
    const host = canvasRef.current?.parentElement;
    if (!host || !rendererRef.current) return;
    const width = Math.max(host.clientWidth, 320);
    const height = Math.max(440, Math.min(width * 0.68, 760));
    rendererRef.current.resize(width, height);
    rendererRef.current.render(preset);
  }, [preset]);

  return (
    <div className="overflow-hidden rounded-3xl border border-cyan-200/25 bg-slate-950 p-3 shadow-2xl shadow-cyan-500/25">
      <canvas
        ref={canvasRef}
        className="block min-h-[440px] w-full rounded-2xl bg-slate-950"
        aria-label="Fractal matemático WebGL generado por shader de escape-time"
      />
    </div>
  );
}
