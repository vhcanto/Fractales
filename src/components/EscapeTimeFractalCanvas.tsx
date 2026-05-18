import { useCallback, useEffect, useRef, useState } from 'react';
import { EscapeTimeFractalRenderer } from '../lib/fractal/escape-time/EscapeTimeFractalRenderer';
import { panCamera, screenToComplex, zoomCameraAt, type ComplexPoint } from '../lib/fractal/escape-time/camera/fractalCamera';
import { getPreviewIterations, tunePresetForZoom, type EscapeTimePreset } from '../lib/fractal/escape-time/presets/escapeTimePresets';

interface EscapeTimeFractalCanvasProps {
  preset: EscapeTimePreset;
  onPresetChange?: (preset: EscapeTimePreset) => void;
  onComplexPointChange?: (point: ComplexPoint) => void;
  onRendererError?: (error: unknown) => void;
  onRenderStatusChange?: (status: 'recalculando' | 'estable') => void;
  explorationMode?: boolean;
}

const MIN_CANVAS_WIDTH = 320;
const MIN_CANVAS_HEIGHT = 520;
const WHEEL_ZOOM_STRENGTH = 0.00125;
const DOUBLE_CLICK_ZOOM = 2.2;
const REFINEMENT_DEBOUNCE_MS = 320;

const getTechnicalMessage = (error: unknown): string => {
  if (error instanceof Error && error.message.trim()) return error.message;
  if (typeof error === 'string' && error.trim()) return error;
  return 'Error WebGL desconocido.';
};

export function EscapeTimeFractalCanvas({
  preset,
  onPresetChange,
  onComplexPointChange,
  onRendererError,
  onRenderStatusChange,
  explorationMode = false,
}: EscapeTimeFractalCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<EscapeTimeFractalRenderer | null>(null);
  const latestPresetRef = useRef(preset);
  const onRendererErrorRef = useRef(onRendererError);
  const onPresetChangeRef = useRef(onPresetChange);
  const onComplexPointChangeRef = useRef(onComplexPointChange);
  const onRenderStatusChangeRef = useRef(onRenderStatusChange);
  const hasFailedRef = useRef(false);
  const dragStartRef = useRef<ComplexPoint | null>(null);
  const dragPresetRef = useRef<EscapeTimePreset | null>(null);
  const refinementTimerRef = useRef<number | null>(null);
  const [statusMessage, setStatusMessage] = useState('Preparando prueba interna WebGL…');
  const [isDragging, setIsDragging] = useState(false);

  const clearRefinementTimer = useCallback(() => {
    if (refinementTimerRef.current !== null) {
      window.clearTimeout(refinementTimerRef.current);
      refinementTimerRef.current = null;
    }
  }, []);

  const publishPreset = useCallback((nextPreset: EscapeTimePreset, progressive = true) => {
    const finalPreset = tunePresetForZoom(nextPreset);

    if (!progressive) {
      clearRefinementTimer();
      latestPresetRef.current = finalPreset;
      onPresetChangeRef.current?.(finalPreset);
      setStatusMessage('estable');
      onRenderStatusChangeRef.current?.('estable');
      return;
    }

    clearRefinementTimer();
    const previewPreset = {
      ...finalPreset,
      maxIterations: getPreviewIterations(finalPreset.zoom, finalPreset.fractalType),
    };

    latestPresetRef.current = previewPreset;
    onPresetChangeRef.current?.(previewPreset);
    setStatusMessage('recalculando');
    onRenderStatusChangeRef.current?.('recalculando');

    refinementTimerRef.current = window.setTimeout(() => {
      latestPresetRef.current = finalPreset;
      onPresetChangeRef.current?.(finalPreset);
      setStatusMessage('estable');
      onRenderStatusChangeRef.current?.('estable');
      refinementTimerRef.current = null;
    }, REFINEMENT_DEBOUNCE_MS);
  }, [clearRefinementTimer]);

  useEffect(() => {
    latestPresetRef.current = preset;
  }, [preset, explorationMode]);

  useEffect(() => {
    onRendererErrorRef.current = onRendererError;
    onPresetChangeRef.current = onPresetChange;
    onComplexPointChangeRef.current = onComplexPointChange;
    onRenderStatusChangeRef.current = onRenderStatusChange;
  }, [onRendererError, onPresetChange, onComplexPointChange, onRenderStatusChange]);

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
      const viewportHeight = typeof window === 'undefined' ? MIN_CANVAS_HEIGHT : window.innerHeight;
      const height = explorationMode
        ? Math.max(MIN_CANVAS_HEIGHT, Math.floor(viewportHeight - 132))
        : Math.max(MIN_CANVAS_HEIGHT, Math.min(width * 0.72, 860));
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
          setStatusMessage('Render matemático WebGL activo');
        }

        rendererRef.current.render(latestPresetRef.current);
        setStatusMessage('estable');
        onRenderStatusChangeRef.current?.('estable');
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
      clearRefinementTimer();
    };
  }, [clearRefinementTimer, explorationMode]);

  useEffect(() => {
    const host = containerRef.current;
    const renderer = rendererRef.current;
    if (!host || !renderer || hasFailedRef.current) return;

    const rect = host.getBoundingClientRect();
    const measuredWidth = rect.width || host.clientWidth;
    if (!Number.isFinite(measuredWidth) || measuredWidth < 1) return;

    const width = Math.max(Math.floor(measuredWidth), MIN_CANVAS_WIDTH);
    const viewportHeight = typeof window === 'undefined' ? MIN_CANVAS_HEIGHT : window.innerHeight;
    const height = explorationMode
      ? Math.max(MIN_CANVAS_HEIGHT, Math.floor(viewportHeight - 132))
      : Math.max(MIN_CANVAS_HEIGHT, Math.min(width * 0.72, 860));

    try {
      renderer.resize(width, height, typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1);
      renderer.render(preset);
    } catch (error) {
      hasFailedRef.current = true;
      console.error('No fue posible actualizar el render matemático WebGL.', error);
      window.setTimeout(() => setStatusMessage(`WebGL no pudo renderizar: ${getTechnicalMessage(error)}`), 0);
      onRendererErrorRef.current?.(error);
    }
  }, [preset, explorationMode]);

  const getLocalPoint = (event: React.PointerEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement> | React.WheelEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      width: rect.width,
      height: rect.height,
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const local = getLocalPoint(event);
    if (!local) return;

    const viewport = { width: local.width, height: local.height };
    onComplexPointChangeRef.current?.(screenToComplex(local.x, local.y, viewport, latestPresetRef.current));

    if (!dragStartRef.current || !dragPresetRef.current) return;
    const nextPreset = panCamera(dragPresetRef.current, dragStartRef.current, { x: local.x, y: local.y }, viewport);
    publishPreset(nextPreset);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const local = getLocalPoint(event);
    if (!local) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStartRef.current = { x: local.x, y: local.y };
    dragPresetRef.current = latestPresetRef.current;
    setIsDragging(true);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    dragStartRef.current = null;
    dragPresetRef.current = null;
    setIsDragging(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const handleNativeWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const local = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        width: rect.width,
        height: rect.height,
      };
      const zoomFactor = Math.exp(-event.deltaY * WHEEL_ZOOM_STRENGTH);
      publishPreset(zoomCameraAt(latestPresetRef.current, local.x, local.y, { width: local.width, height: local.height }, zoomFactor));
    };

    canvas.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleNativeWheel);
  }, [publishPreset]);

  const handleDoubleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const local = getLocalPoint(event);
    if (!local) return;
    publishPreset(zoomCameraAt(latestPresetRef.current, local.x, local.y, { width: local.width, height: local.height }, DOUBLE_CLICK_ZOOM));
  };

  return (
    <div className={`overflow-hidden border border-cyan-200/25 bg-slate-950 p-3 shadow-2xl shadow-cyan-500/25 ${explorationMode ? 'h-full rounded-[1.75rem]' : 'rounded-3xl'}`}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex rounded-full border border-cyan-200/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
          {statusMessage}
        </span>
        <span className="text-xs text-slate-400">Scroll: zoom · Arrastrar: mover · Doble clic: acercar</span>
      </div>
      <div ref={containerRef} className={`${explorationMode ? 'min-h-[calc(100vh-132px)]' : 'min-h-[520px]'} w-full rounded-2xl overscroll-contain`}>
        <canvas
          ref={canvasRef}
          className={`block ${explorationMode ? 'min-h-[calc(100vh-132px)]' : 'min-h-[520px]'} w-full touch-none overscroll-contain rounded-2xl bg-slate-950 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          aria-label="Fractal matemático WebGL generado por shader de escape-time"
          onDoubleClick={handleDoubleClick}
          onPointerCancel={handlePointerUp}
          onPointerDown={handlePointerDown}
          onPointerLeave={handlePointerUp}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
      </div>
    </div>
  );
}
