import { useEffect, useRef, useState } from 'react';
import { Application } from 'pixi.js';
import { PixiFractalRenderer } from '../lib/fractal/pixi/PixiFractalRenderer';
import type { FractalRenderInput } from '../types/fractal';

interface FractalPixiCanvasProps {
  renderInput: FractalRenderInput;
  onRendererError?: () => void;
}

export function FractalPixiCanvas({ renderInput, onRendererError }: FractalPixiCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const appRef = useRef<Application | null>(null);
  const rendererRef = useRef<PixiFractalRenderer | null>(null);
  const latestInputRef = useRef(renderInput);
  const [statusMessage, setStatusMessage] = useState('Inicializando fallback PixiJS…');

  const onRendererErrorRef = useRef(onRendererError);

  useEffect(() => {
    latestInputRef.current = renderInput;
  }, [renderInput]);

  useEffect(() => {
    onRendererErrorRef.current = onRendererError;
  }, [onRendererError]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    let isMounted = true;
    let resizeObserver: ResizeObserver | null = null;

    const renderCurrentInput = () => {
      const app = appRef.current;
      const renderer = rendererRef.current;
      const host = containerRef.current;
      if (!app || !renderer || !host) return;

      const width = Math.max(host.clientWidth, 320);
      const height = Math.max(420, Math.min(width * 0.68, 720));
      host.style.minHeight = `${height}px`;
      try {
        app.renderer.resize(width, height);
        renderer.render(latestInputRef.current, width, height);
        window.setTimeout(() => setStatusMessage('Fallback PixiJS activo'), 0);
      } catch (error) {
        console.error('No fue posible renderizar PixiJS.', error);
        window.setTimeout(() => setStatusMessage('PixiJS falló. Activando Canvas básico…'), 0);
        onRendererErrorRef.current?.();
      }
    };

    const initPixi = async () => {
      try {
        const app = new Application();
        await app.init({
          antialias: true,
          autoDensity: true,
          backgroundAlpha: 0,
          hello: false,
          preference: 'webgl',
          resolution: Math.min(window.devicePixelRatio || 1, 2),
          width: Math.max(container.clientWidth, 320),
          height: 420,
        });

        if (!isMounted) {
          app.destroy(true);
          return;
        }

        appRef.current = app;
        rendererRef.current = new PixiFractalRenderer(app);
        app.canvas.className = 'block min-h-[420px] w-full rounded-2xl';
        app.canvas.setAttribute('aria-label', 'Render fractal premium generado con PixiJS');
        container.appendChild(app.canvas);

        resizeObserver = new ResizeObserver(renderCurrentInput);
        resizeObserver.observe(container);
        renderCurrentInput();
      } catch (error) {
        console.error('No fue posible iniciar PixiJS.', error);
        window.setTimeout(() => setStatusMessage('PixiJS falló. Activando Canvas básico…'), 0);
        onRendererErrorRef.current?.();
      }
    };

    void initPixi();

    return () => {
      isMounted = false;
      resizeObserver?.disconnect();
      rendererRef.current?.destroy();
      rendererRef.current = null;
      appRef.current?.destroy(true);
      appRef.current = null;
      container.replaceChildren();
    };
  }, []);

  useEffect(() => {
    const host = containerRef.current;
    const renderer = rendererRef.current;
    const app = appRef.current;
    if (!host || !renderer || !app) return;

    const width = Math.max(host.clientWidth, 320);
    const height = Math.max(420, Math.min(width * 0.68, 720));
    try {
      app.renderer.resize(width, height);
      renderer.render(renderInput, width, height);
      window.setTimeout(() => setStatusMessage('Fallback PixiJS activo'), 0);
    } catch (error) {
      console.error('No fue posible actualizar PixiJS.', error);
      window.setTimeout(() => setStatusMessage('PixiJS falló. Activando Canvas básico…'), 0);
      onRendererErrorRef.current?.();
    }
  }, [renderInput]);

  return (
    <div className="overflow-hidden rounded-3xl border border-cyan-300/20 bg-slate-950/90 p-3 shadow-2xl shadow-cyan-500/20">
      <div className="mb-3 inline-flex rounded-full border border-cyan-200/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
        {statusMessage}
      </div>
      <div ref={containerRef} className="min-h-[420px] w-full rounded-2xl" />
    </div>
  );
}
