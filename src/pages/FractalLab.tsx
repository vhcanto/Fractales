import { useState } from 'react';
import { EscapeTimeFractalCanvas } from '../components/EscapeTimeFractalCanvas';
import { FractalControls } from '../components/FractalControls';
import { FractalErrorBoundary } from '../components/FractalErrorBoundary';
import { ParameterPanel } from '../components/ParameterPanel';
import { clonePreset, resetPresetCamera, type ComplexPoint } from '../lib/fractal/escape-time/camera/fractalCamera';
import {
  getEscapeTimePresetByType,
  type EscapeTimeFractalType,
  type EscapeTimePreset,
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

  return {
    ...resetPresetCamera(preset),
    centerX: preset.initialCenterX + Math.cos(phase) * centerScale * 0.24,
    centerY: preset.initialCenterY + Math.sin(phase * 1.31) * centerScale * 0.24,
    zoom: preset.initialZoom * zoomFactor,
    colorShift: (preset.colorShift + 0.04 + Math.random() * 0.12) % 1,
  };
};

export function FractalLab() {
  const [fractalType, setFractalType] = useState<EscapeTimeFractalType>('mandelbrot');
  const [activePreset, setActivePreset] = useState<EscapeTimePreset>(() => clonePreset(getEscapeTimePresetByType('mandelbrot')));
  const [complexPoint, setComplexPoint] = useState<ComplexPoint | null>(null);
  const [webglError, setWebglError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  const changeFractalType = (nextType: EscapeTimeFractalType) => {
    const nextPreset = clonePreset(getEscapeTimePresetByType(nextType));
    setFractalType(nextType);
    setActivePreset(nextPreset);
    setComplexPoint(null);
    setWebglError(null);
    setRetryToken((current) => current + 1);
  };

  const resetView = () => {
    setActivePreset((current) => resetPresetCamera(current));
    setComplexPoint(null);
  };

  const regenerateView = () => {
    setActivePreset((current) => regeneratePreset(current));
    setComplexPoint(null);
  };

  const retryWebGL = () => {
    setWebglError(null);
    setRetryToken((current) => current + 1);
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

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <main className="space-y-6">
        <FractalControls
          onFractalTypeChange={changeFractalType}
          onRegenerateView={regenerateView}
          onResetView={resetView}
          onRetryWebGL={retryWebGL}
          selectedFractalType={fractalType}
          showRetryWebGL={Boolean(webglError)}
        />
        <FractalErrorBoundary fallback={finalFallbackCard}>
          {webglError ? (
            webglErrorCard
          ) : (
            <EscapeTimeFractalCanvas
              key={retryToken}
              preset={activePreset}
              onComplexPointChange={setComplexPoint}
              onPresetChange={setActivePreset}
              onRendererError={(error) => setWebglError(getErrorMessage(error))}
            />
          )}
        </FractalErrorBoundary>
      </main>
      <ParameterPanel escapePreset={activePreset} complexPoint={complexPoint} webglStatus={webglError ? 'error' : 'activo'} />
    </div>
  );
}
