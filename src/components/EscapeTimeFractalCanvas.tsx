import { useCallback, useEffect, useRef, useState } from 'react';
import { EscapeTimeFractalRenderer } from '../lib/fractal/escape-time/EscapeTimeFractalRenderer';
import { screenToComplex, type ComplexPoint } from '../lib/fractal/escape-time/camera/fractalCamera';
import { DeepZoomCamera, type DeepZoomDisplayState } from '../lib/fractal/deep-zoom/DeepZoomCamera';
import { applyRenderStageQuality, RENDER_STAGE_DELAYS, tunePresetForZoom, type EscapeTimePreset, type RenderStage } from '../lib/fractal/escape-time/presets/escapeTimePresets';

interface EscapeTimeFractalCanvasProps {
  preset: EscapeTimePreset;
  onPresetChange?: (preset: EscapeTimePreset) => void;
  onComplexPointChange?: (point: ComplexPoint) => void;
  onRendererError?: (error: unknown) => void;
  onRenderStatusChange?: (status: RenderStage) => void;
  onEngineStatsChange?: (stats: {
    stage: RenderStage;
    progress: number;
    fps: number;
    renderMs: number;
    precisionLevel: string;
  }) => void;
  explorationMode?: boolean;
  onCanvasReady?: (canvas: HTMLCanvasElement | null) => void;
  onDeepZoomStateChange?: (state: DeepZoomDisplayState | null) => void;
}

const MIN_CANVAS_WIDTH = 320;
const MIN_CANVAS_HEIGHT = 520;
const WHEEL_ZOOM_STRENGTH = 0.00075;
const DOUBLE_CLICK_ZOOM = 2.2;

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
  onEngineStatsChange,
  explorationMode = false,
  onCanvasReady,
  onDeepZoomStateChange,
}: EscapeTimeFractalCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<EscapeTimeFractalRenderer | null>(null);
  const latestPresetRef = useRef(preset);
  const onRendererErrorRef = useRef(onRendererError);
  const onPresetChangeRef = useRef(onPresetChange);
  const onComplexPointChangeRef = useRef(onComplexPointChange);
  const onRenderStatusChangeRef = useRef(onRenderStatusChange);
  const onEngineStatsChangeRef = useRef(onEngineStatsChange);
  const hasFailedRef = useRef(false);
  const dragStartRef = useRef<ComplexPoint | null>(null);
  const dragPresetRef = useRef<EscapeTimePreset | null>(null);
  const refineTimerMediumRef = useRef<number | null>(null);
  const refineTimerFinalRef = useRef<number | null>(null);
  const [statusMessage, setStatusMessage] = useState('ETAPA 3 ESTABLE · BASE PARA DEEP ZOOM REAL');
  const [isDragging, setIsDragging] = useState(false);
  const targetPresetRef = useRef<EscapeTimePreset>(preset);
  const deepZoomCameraRef = useRef<DeepZoomCamera | null>(null);

  const clearRefinementTimers = useCallback(() => {
    if (refineTimerMediumRef.current !== null) {
      window.clearTimeout(refineTimerMediumRef.current);
      refineTimerMediumRef.current = null;
    }
    if (refineTimerFinalRef.current !== null) {
      window.clearTimeout(refineTimerFinalRef.current);
      refineTimerFinalRef.current = null;
    }
  }, []);

  const getCanvasPixelCount = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return 1_000_000;
    return Math.max(1, canvas.width * canvas.height);
  }, []);

  const publishStage = useCallback((nextPreset: EscapeTimePreset, stage: RenderStage) => {
    const stagedPreset = applyRenderStageQuality(nextPreset, stage, getCanvasPixelCount());
    latestPresetRef.current = stagedPreset;
    onPresetChangeRef.current?.(stagedPreset);
    setStatusMessage(stage);
    onRenderStatusChangeRef.current?.(stage);
  }, [getCanvasPixelCount]);

  const publishPreset = useCallback((nextPreset: EscapeTimePreset, progressive = true) => {
    const finalPreset = tunePresetForZoom({ ...nextPreset, renderStage: 'final' });

    clearRefinementTimers();
    if (!progressive) {
      publishStage(finalPreset, 'final');
      return;
    }

    publishStage(finalPreset, 'preview');

    refineTimerMediumRef.current = window.setTimeout(() => {
      publishStage(finalPreset, 'refining');
      refineTimerMediumRef.current = null;
    }, RENDER_STAGE_DELAYS.mediumMs);

    refineTimerFinalRef.current = window.setTimeout(() => {
      publishStage(finalPreset, 'final');
      refineTimerFinalRef.current = null;
    }, RENDER_STAGE_DELAYS.finalMs);
  }, [clearRefinementTimers, publishStage]);

  useEffect(() => {
    latestPresetRef.current = preset;
    targetPresetRef.current = preset;
    deepZoomCameraRef.current = preset.fractalType === 'mandelbrot' ? new DeepZoomCamera(preset) : null;
    onDeepZoomStateChange?.(deepZoomCameraRef.current?.getDisplayState() ?? null);
  }, [preset, explorationMode, onDeepZoomStateChange]);

  const smoothPresetTransition = useCallback((nextPreset: EscapeTimePreset, progressive = true) => {
    publishPreset(nextPreset, progressive);
  }, [publishPreset]);

  useEffect(() => {
    onRendererErrorRef.current = onRendererError;
    onPresetChangeRef.current = onPresetChange;
    onComplexPointChangeRef.current = onComplexPointChange;
    onRenderStatusChangeRef.current = onRenderStatusChange;
    onEngineStatsChangeRef.current = onEngineStatsChange;
  }, [onRendererError, onPresetChange, onComplexPointChange, onRenderStatusChange, onEngineStatsChange]);

  useEffect(() => {
    onCanvasReady?.(canvasRef.current);
    return () => onCanvasReady?.(null);
  }, [onCanvasReady]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = containerRef.current;
    if (!canvas || !host) return undefined;

    let resizeObserver: ResizeObserver | null = null;
    let frame = 0;
    let isMounted = true;
    let gradientPassed = false;
    let rafId = 0;
    let lastFrameAt = performance.now();

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
        const now = performance.now();
        const delta = Math.max(1, now - lastFrameAt);
        const fps = 1000 / delta;
        lastFrameAt = now;
        const stage = latestPresetRef.current.renderStage;
        const progress = stage === 'preview' ? 0.2 : stage === 'refining' ? 0.62 : 1;
        const zoom = latestPresetRef.current.zoom;
        const precisionLevel = zoom < 100 ? 'float-32' : zoom < 10000 ? 'float-48' : 'float-64+ emulada';
        onEngineStatsChangeRef.current?.({
          stage,
          progress,
          fps,
          renderMs: rendererRef.current.getLastRenderMs(),
          precisionLevel,
        });
        const warning = rendererRef.current.getLastTechnicalWarning();
        setStatusMessage(warning ? `${latestPresetRef.current.renderStage} · ${warning}` : latestPresetRef.current.renderStage);
        onRenderStatusChangeRef.current?.(latestPresetRef.current.renderStage);
        rafId = window.requestAnimationFrame(renderCurrentPreset);
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
      window.cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      rendererRef.current?.destroy();
      rendererRef.current = null;
      clearRefinementTimers();
    };
  }, [clearRefinementTimers, explorationMode]);

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
      const warning = renderer.getLastTechnicalWarning();
      if (warning) setStatusMessage(`${preset.renderStage} · ${warning}`);
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
    let nextPreset: EscapeTimePreset;
    if (dragPresetRef.current.fractalType === 'mandelbrot' && deepZoomCameraRef.current) {
      deepZoomCameraRef.current.pan(local.x - dragStartRef.current.x, local.y - dragStartRef.current.y, viewport.width, viewport.height);
      const shader = deepZoomCameraRef.current.toShaderUniforms();
      nextPreset = { ...dragPresetRef.current, ...shader };
      onDeepZoomStateChange?.(deepZoomCameraRef.current.getDisplayState());
    } else {
      const start = screenToComplex(dragStartRef.current.x, dragStartRef.current.y, viewport, dragPresetRef.current);
      const end = screenToComplex(local.x, local.y, viewport, dragPresetRef.current);
      nextPreset = { ...dragPresetRef.current, centerX: dragPresetRef.current.centerX + (start.x - end.x), centerY: dragPresetRef.current.centerY + (start.y - end.y) };
    }
    targetPresetRef.current = nextPreset;
    smoothPresetTransition(nextPreset);
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
      event.stopPropagation();
      const zoomFactor = Math.exp(-event.deltaY * WHEEL_ZOOM_STRENGTH);
      let target: EscapeTimePreset;
      if (targetPresetRef.current.fractalType === 'mandelbrot' && deepZoomCameraRef.current) {
        deepZoomCameraRef.current.zoomAtScreenPoint(local.x, local.y, local.width, local.height, zoomFactor);
        target = { ...targetPresetRef.current, ...deepZoomCameraRef.current.toShaderUniforms() };
        onDeepZoomStateChange?.(deepZoomCameraRef.current.getDisplayState());
      } else {
        const before = screenToComplex(local.x, local.y, { width: local.width, height: local.height }, targetPresetRef.current);
        const zoom = Math.min(targetPresetRef.current.maxZoom, Math.max(targetPresetRef.current.minZoom, targetPresetRef.current.zoom * zoomFactor));
        const zoomed = { ...targetPresetRef.current, zoom };
        const after = screenToComplex(local.x, local.y, { width: local.width, height: local.height }, zoomed);
        target = { ...zoomed, centerX: targetPresetRef.current.centerX + (before.x - after.x), centerY: targetPresetRef.current.centerY + (before.y - after.y) };
      }
      targetPresetRef.current = target;
      smoothPresetTransition(target);
    };

    canvas.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleNativeWheel);
  }, [publishPreset]);

  const handleDoubleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const local = getLocalPoint(event);
    if (!local) return;
    let target: EscapeTimePreset;
    if (targetPresetRef.current.fractalType === 'mandelbrot' && deepZoomCameraRef.current) {
      deepZoomCameraRef.current.zoomAtScreenPoint(local.x, local.y, local.width, local.height, DOUBLE_CLICK_ZOOM);
      target = { ...targetPresetRef.current, ...deepZoomCameraRef.current.toShaderUniforms() };
      onDeepZoomStateChange?.(deepZoomCameraRef.current.getDisplayState());
    } else {
      const before = screenToComplex(local.x, local.y, { width: local.width, height: local.height }, targetPresetRef.current);
      const zoom = Math.min(targetPresetRef.current.maxZoom, Math.max(targetPresetRef.current.minZoom, targetPresetRef.current.zoom * DOUBLE_CLICK_ZOOM));
      const zoomed = { ...targetPresetRef.current, zoom };
      const after = screenToComplex(local.x, local.y, { width: local.width, height: local.height }, zoomed);
      target = { ...zoomed, centerX: targetPresetRef.current.centerX + (before.x - after.x), centerY: targetPresetRef.current.centerY + (before.y - after.y) };
    }
    targetPresetRef.current = target;
    smoothPresetTransition(target);
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
