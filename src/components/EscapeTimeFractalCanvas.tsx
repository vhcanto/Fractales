import { useEffect, useRef, useState } from 'react';
import { EscapeTimeFractalRenderer } from '../lib/fractal/escape-time/EscapeTimeFractalRenderer';
import type { EscapeTimePreset } from '../lib/fractal/escape-time/presets/escapeTimePresets';

interface EscapeTimeFractalCanvasProps {
  preset: EscapeTimePreset;
  onRendererError?: (error: unknown) => void;
}

const MIN_CANVAS_WIDTH = 320;
const MIN_CANVAS_HEIGHT = 440;

const getTechnicalMessage = (error: unknown): string => {
  if (error instanceof Error && error.message.trim()) return error.message;
  if (typeof error === 'string' && error.trim()) return error;
  return 'Error WebGL desconocido.';
};

export function EscapeTimeFractalCanvas({ preset, onRendererError }: EscapeTimeFractalCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<EscapeTimeFractalRenderer | null>(null);
  const latestPresetRef = useRef(preset);
  const onRendererErrorRef = useRef(onRendererError);
  const hasFailedRef = useRef(false);
  const [statusMessage, setStatusMessage] = useState('Preparando prueba interna WebGL…');

  useEffect(() => {
    latestPresetRef.current = preset;
  }, [preset]);

  useEffect(() => {
    onRendererErrorRef.current = onRendererError;
  }, [onRendererError]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = containerRef.current;
    if (!canvas || !host) return undefined;

    let resizeObserver: ResizeObserver | null = null;
    let frame = 0;
    let isMounted = true;
    let gradientPassed = false;

    const failSafely = (message: string, error: unknown) => {
      if (hasFailedRef.current) return;
      hasFailedRef.current = true;
      const reason = getTechnicalMessage(error);
      console.error(message, error);
      window.setTimeout(() => setStatusMessage(`WebGL no pudo renderizar: ${reason}`), 0);
      rendererRef.current?.destroy();
      rendererRef.current = null;
      onRendererErrorRef.current?.(error);
    };

    const measureHost = () => {
      const rect = host.getBoundingClientRect();
      const measuredWidth = rect.width || host.clientWidth;
      if (!Number.isFinite(measuredWidth) || measuredWidth < 1) return null;

      const width = Math.max(Math.floor(measuredWidth), MIN_CANVAS_WIDTH);
      const height = Math.max(MIN_CANVAS_HEIGHT, Math.min(width * 0.68, 760));
      return { width, height };
    };

    const renderCurrentPreset = () => {
      if (!isMounted || hasFailedRef.current) return;

      const size = measureHost();
      if (!size) {
        setStatusMessage('Esperando dimensiones válidas del contenedor WebGL…');
        frame = window.requestAnimationFrame(renderCurrentPreset);
        return;
      }

      try {
        if (!rendererRef.current) {
          rendererRef.current = new EscapeTimeFractalRenderer(canvas);
        }

        const dpr = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1;
        rendererRef.current.resize(size.width, size.height, dpr);

        if (!gradientPassed) {
          rendererRef.current.renderGradientTest();
          gradientPassed = true;
          setStatusMessage('Prueba WebGL de gradiente correcta. Activando fractal…');
        }

        rendererRef.current.render(latestPresetRef.current);
        setStatusMessage('Render matemático WebGL activo');
      } catch (error) {
        failSafely('No fue posible renderizar el fractal matemático WebGL.', error);
      }
    };

    try {
      resizeObserver = new ResizeObserver(() => {
        window.cancelAnimationFrame(frame);
        frame = window.requestAnimationFrame(renderCurrentPreset);
      });
      resizeObserver.observe(host);
      frame = window.requestAnimationFrame(renderCurrentPreset);
    } catch (error) {
      failSafely('No fue posible observar el tamaño del contenedor WebGL.', error);
    }

    return () => {
      isMounted = false;
      window.cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      rendererRef.current?.destroy();
      rendererRef.current = null;
    };
  }, []);

  useEffect(() => {
    const host = containerRef.current;
    const renderer = rendererRef.current;
    if (!host || !renderer || hasFailedRef.current) return;

    const rect = host.getBoundingClientRect();
    const measuredWidth = rect.width || host.clientWidth;
    if (!Number.isFinite(measuredWidth) || measuredWidth < 1) return;

    const width = Math.max(Math.floor(measuredWidth), MIN_CANVAS_WIDTH);
    const height = Math.max(MIN_CANVAS_HEIGHT, Math.min(width * 0.68, 760));

    try {
      renderer.resize(width, height, typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1);
      renderer.render(preset);
    } catch (error) {
      hasFailedRef.current = true;
      console.error('No fue posible actualizar el render matemático WebGL.', error);
      window.setTimeout(() => setStatusMessage(`WebGL no pudo renderizar: ${getTechnicalMessage(error)}`), 0);
      onRendererErrorRef.current?.(error);
    }
  }, [preset]);

  return (
    <div className="overflow-hidden rounded-3xl border border-cyan-200/25 bg-slate-950 p-3 shadow-2xl shadow-cyan-500/25">
      <div className="mb-3 inline-flex rounded-full border border-cyan-200/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
        {statusMessage}
      </div>
      <div ref={containerRef} className="min-h-[440px] w-full rounded-2xl">
        <canvas
          ref={canvasRef}
          className="block min-h-[440px] w-full rounded-2xl bg-slate-950"
          aria-label="Fractal matemático WebGL generado por shader de escape-time"
        />
      </div>
    </div>
  );
}
