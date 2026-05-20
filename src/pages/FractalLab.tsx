import { useEffect, useState } from 'react';
import { EscapeTimeFractalCanvas } from '../components/EscapeTimeFractalCanvas';
import { FractalControls } from '../components/FractalControls';
import { FractalErrorBoundary } from '../components/FractalErrorBoundary';
import { ParameterPanel } from '../components/ParameterPanel';
import { clonePreset, resetPresetCamera } from '../lib/fractal/escape-time/camera/fractalCamera';
import {
  fractalTypeLabels,
  getDepthLevel,
  getEscapeTimePresetByType,
  tunePresetForZoom,
  type EscapeTimeFractalType,
  type EscapeTimePreset,
  type EscapeTimeViewKind,
  type RenderStage,
} from '../lib/fractal/escape-time/presets/escapeTimePresets';

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message.trim()) return error.message;
  if (typeof error === 'string' && error.trim()) return error;
  return 'Error WebGL desconocido. Revisa la consola para el log técnico completo.';
};

const regeneratePreset = (preset: EscapeTimePreset): EscapeTimePreset => {
  const phase = Math.random() * Math.PI * 2;
  const centerScale = 1 / Math.max(preset.initialZoom, 1);
  const zoomFactor = 0.86 + Math.random() * 0.34;

  return tunePresetForZoom({
    ...resetPresetCamera(preset),
    centerX: preset.initialCenterX + Math.cos(phase) * centerScale * 0.24,
    centerY: preset.initialCenterY + Math.sin(phase * 1.31) * centerScale * 0.24,
    zoom: preset.initialZoom * zoomFactor,
    colorShift: (preset.colorShift + 0.04 + Math.random() * 0.12) % 1,
  });
};

export function FractalLab() {
  const [renderCanvas, setRenderCanvas] = useState<HTMLCanvasElement | null>(null);
  const [fractalType, setFractalType] = useState<EscapeTimeFractalType>('mandelbrot');
  const [activePreset, setActivePreset] = useState<EscapeTimePreset>(() => tunePresetForZoom(clonePreset(getEscapeTimePresetByType('mandelbrot'))));
  const [webglError, setWebglError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);
  const [isExplorationMode, setIsExplorationMode] = useState(false);
  const [renderStatus, setRenderStatus] = useState<RenderStage>('final');
  const [qualityCompare, setQualityCompare] = useState<'stage2' | 'stage3'>('stage3');
  const [engineStats, setEngineStats] = useState({ stage: 'final' as RenderStage, progress: 1, fps: 0, renderMs: 0, precisionLevel: 'float-32' });

  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', isExplorationMode);
    return () => document.body.classList.remove('overflow-hidden');
  }, [isExplorationMode]);

  const applyPreset = (nextType: EscapeTimeFractalType, view: EscapeTimeViewKind) => {
    const nextPreset = tunePresetForZoom(clonePreset(getEscapeTimePresetByType(nextType, view)));
    setFractalType(nextType);
    setActivePreset(nextPreset);
    setWebglError(null);
    setRetryToken((current) => current + 1);
    setRenderStatus('final');
  };

  const changeFractalType = (nextType: EscapeTimeFractalType) => {
    applyPreset(nextType, 'full');
  };

  const setFullView = () => applyPreset(fractalType, 'full');

  const setDeepView = () => applyPreset(fractalType, 'deep');

  const resetView = () => {
    setActivePreset((current) => tunePresetForZoom(resetPresetCamera(current)));
    setRenderStatus('final');
  };

  const regenerateView = () => {
    setActivePreset((current) => regeneratePreset(current));
    setRenderStatus('final');
  };

  const retryWebGL = () => {
    setWebglError(null);
    setRetryToken((current) => current + 1);
    setRenderStatus('final');
  };

  const exportPng = () => {
    if (!renderCanvas) return;
    const upscale = 2;
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = Math.max(1, Math.floor(renderCanvas.width * upscale));
    exportCanvas.height = Math.max(1, Math.floor(renderCanvas.height * upscale));
    const context = exportCanvas.getContext('2d');
    if (!context) return;
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(renderCanvas, 0, 0, exportCanvas.width, exportCanvas.height);
    const link = document.createElement('a');
    link.download = `${fractalType}-${new Date().toISOString().replaceAll(':', '-').slice(0, 19)}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
  };

  const webglErrorCard = (
    <div className="flex min-h-[520px] items-center justify-center rounded-3xl border border-rose-300/30 bg-rose-950/30 p-6 text-rose-100 shadow-2xl shadow-rose-950/20">
      <div className="max-w-2xl text-center">
        <p className="text-sm uppercase tracking-[0.32em] text-rose-200">WebGL no pudo renderizar</p>
        <h3 className="mt-3 text-2xl font-semibold text-white">El motor matemático se mantuvo seleccionado.</h3>
        <p className="mt-4 rounded-2xl border border-rose-200/15 bg-slate-950/60 p-4 font-mono text-sm text-rose-100">
          {webglError ?? 'No hay motivo técnico disponible.'}
        </p>
        <button
          type="button"
          onClick={retryWebGL}
          className="mt-5 rounded-2xl border border-cyan-200/40 px-5 py-3 font-semibold text-cyan-100 transition hover:-translate-y-0.5 hover:bg-cyan-300/10"
        >
          Reintentar WebGL
        </button>
      </div>
    </div>
  );

  const finalFallbackCard = (
    <div className="flex min-h-[520px] items-center justify-center rounded-3xl border border-rose-300/30 bg-rose-950/30 p-6 text-center text-rose-100 shadow-2xl shadow-rose-950/20">
      No se pudo cargar el render fractal. Revisa consola.
    </div>
  );

  const fractalCanvas = (
    <FractalErrorBoundary fallback={finalFallbackCard}>
      {webglError ? (
        webglErrorCard
      ) : (
        <EscapeTimeFractalCanvas
          key={`${retryToken}-${isExplorationMode ? 'explore' : 'lab'}`}
          explorationMode={isExplorationMode}
          preset={qualityCompare === 'stage2' ? {
            ...activePreset,
            renderStage: 'preview',
            samples: 1,
            maxIterations: Math.max(420, Math.round(activePreset.maxIterations * 0.32)),
            gamma: 1,
            contrast: 1,
            brightness: 1,
            saturation: 0.88,
          } : activePreset}
          onPresetChange={setActivePreset}
          onRendererError={(error) => setWebglError(getErrorMessage(error))}
          onRenderStatusChange={setRenderStatus}
          onEngineStatsChange={setEngineStats}
          onCanvasReady={setRenderCanvas}
        />
      )}
    </FractalErrorBoundary>
  );

  if (isExplorationMode) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col gap-3 overflow-hidden bg-slate-950 p-3 text-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/10 bg-slate-900/90 px-4 py-3 shadow-2xl shadow-slate-950/50">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Modo exploración · v05-18-13</p>
            <h2 className="text-lg font-semibold text-white">{fractalTypeLabels[fractalType]} · {getDepthLevel(activePreset.zoom)}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <button type="button" onClick={setFullView} className="rounded-2xl border border-cyan-300/30 px-4 py-2 font-semibold text-cyan-100 hover:bg-cyan-300/10">
              Vista completa
            </button>
            <button type="button" onClick={setDeepView} className="rounded-2xl border border-fuchsia-300/30 px-4 py-2 font-semibold text-fuchsia-100 hover:bg-fuchsia-300/10">
              Zona profunda
            </button>
            <button type="button" onClick={resetView} className="rounded-2xl border border-white/15 px-4 py-2 font-semibold text-white hover:bg-white/[0.08]">
              Reset vista
            </button>
            <button type="button" onClick={() => setIsExplorationMode(false)} className="rounded-2xl bg-cyan-300 px-5 py-2 font-bold text-slate-950 hover:bg-cyan-200">
              Salir de exploración
            </button>
          </div>
        </div>
        <div className="grid min-h-0 flex-1 gap-3 xl:grid-cols-[minmax(0,1fr)_300px]">
          <main className="min-h-0">{fractalCanvas}</main>
          <div className="hidden xl:block">
            <ParameterPanel escapePreset={activePreset} webglStatus={webglError ? 'error' : 'activo'} renderStatus={renderStatus} engineStats={engineStats} compact />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <main className="space-y-6">
        <div className="rounded-3xl border border-fuchsia-300/30 bg-slate-900/75 p-4">
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">SistemaFractales · v05-18-13</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
            {['ETAPA 3 · DEEP FRACTAL ENGINE', 'WEBGL ACTIVE', 'PROGRESSIVE RENDER', 'MULTISAMPLING ACTIVE'].map((badge) => (
              <span key={badge} className="rounded-full border border-cyan-200/20 bg-cyan-300/10 px-3 py-1 text-cyan-100">{badge}</span>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <button type="button" onClick={() => setQualityCompare((c) => c === 'stage3' ? 'stage2' : 'stage3')} className="rounded-xl border border-white/20 px-3 py-2 text-sm text-white">
              Comparar calidad: {qualityCompare === 'stage3' ? 'Modo Etapa 3' : 'Modo Etapa 2'}
            </button>
            <div className="text-xs text-slate-300">Render: {engineStats.stage} [{'█'.repeat(Math.round(engineStats.progress * 10))}{'░'.repeat(10 - Math.round(engineStats.progress * 10))}] {Math.round(engineStats.progress * 100)}%</div>
          </div>
        </div>
        <FractalControls
          onDeepView={setDeepView}
          onEnterExploration={() => setIsExplorationMode(true)}
          onFractalTypeChange={changeFractalType}
          onFullView={setFullView}
          onExportPng={exportPng}
          onRegenerateView={regenerateView}
          onResetView={resetView}
          onRetryWebGL={retryWebGL}
          selectedFractalType={fractalType}
          showRetryWebGL={Boolean(webglError)}
        />
        {fractalCanvas}
      </main>
      <ParameterPanel escapePreset={activePreset} webglStatus={webglError ? 'error' : 'activo'} renderStatus={renderStatus} engineStats={engineStats} />
    </div>
  );
}
