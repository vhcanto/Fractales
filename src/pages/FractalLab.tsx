import { useMemo, useState } from 'react';
import { EscapeTimeFractalCanvas } from '../components/EscapeTimeFractalCanvas';
import { FractalControls, type FractalRenderMode } from '../components/FractalControls';
import { FractalErrorBoundary } from '../components/FractalErrorBoundary';
import { FractalPixiCanvas } from '../components/FractalPixiCanvas';
import { ParameterPanel } from '../components/ParameterPanel';
import { fractalPresets } from '../data/fractalPresets';
import { remedies } from '../data/remedies';
import { getEscapeTimePresetByRemedyId, type EscapeTimePreset } from '../lib/fractal/escape-time/presets/escapeTimePresets';
import { cloneEscapeTimePreset, jitterPreset } from '../lib/fractal/escape-time/utils/fractalMath';
import { mapRemedyToVisualParams, pickRandomItem } from '../lib/remedyMapper';
import type { FractalPreset, FractalRenderInput } from '../types/fractal';
import type { Remedy } from '../types/remedy';

interface FractalSelection {
  remedy: Remedy;
  legacyPreset: FractalPreset;
  escapePreset: EscapeTimePreset;
}

const visibleRemedyIds = ['aconitum', 'pulsatilla', 'nux-vomica'];
const premiumRemedies = remedies.filter((remedy) => visibleRemedyIds.includes(remedy.id));
const defaultRemedy = premiumRemedies.find((remedy) => remedy.id === 'aconitum') ?? (premiumRemedies[0] as Remedy);
const defaultLegacyPreset = fractalPresets.find((preset) => preset.id === 'dendritic-bloom') ?? (fractalPresets[0] as FractalPreset);

const initialSelection: FractalSelection = {
  remedy: defaultRemedy,
  legacyPreset: defaultLegacyPreset,
  escapePreset: cloneEscapeTimePreset(getEscapeTimePresetByRemedyId(defaultRemedy.id)),
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message.trim()) return error.message;
  if (typeof error === 'string' && error.trim()) return error;
  return 'Error WebGL desconocido. Revisa la consola para el log técnico completo.';
};

export function FractalLab() {
  const [selection, setSelection] = useState<FractalSelection>(initialSelection);
  const [renderMode, setRenderMode] = useState<FractalRenderMode>('math');
  const [webglError, setWebglError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  const renderInput = useMemo<FractalRenderInput>(() => {
    const visualParameters = mapRemedyToVisualParams(selection.remedy, selection.legacyPreset);

    return {
      remedyName: selection.remedy.name,
      preset: selection.legacyPreset,
      originalParameters: selection.remedy.parameters,
      visualParameters,
    };
  }, [selection]);

  const updateRemedy = (remedyId: string) => {
    const remedy = premiumRemedies.find((item) => item.id === remedyId);
    if (!remedy) return;
    setWebglError(null);
    setRetryToken((current) => current + 1);
    setSelection((current) => ({
      ...current,
      remedy,
      escapePreset: cloneEscapeTimePreset(getEscapeTimePresetByRemedyId(remedy.id)),
    }));
  };

  const retryWebGL = () => {
    setRenderMode('math');
    setWebglError(null);
    setRetryToken((current) => current + 1);
  };

  const usePixiTemporarily = () => {
    setRenderMode('premium');
  };

  const changeRenderMode = (mode: FractalRenderMode) => {
    setRenderMode(mode);
    if (mode === 'math') {
      setWebglError(null);
      setRetryToken((current) => current + 1);
    }
  };

  const generateRandomFractal = () => {
    const remedy = pickRandomItem(premiumRemedies);
    const escapePreset = jitterPreset(getEscapeTimePresetByRemedyId(remedy.id));
    setWebglError(null);
    setRetryToken((current) => current + 1);
    setSelection({
      remedy,
      legacyPreset: defaultLegacyPreset,
      escapePreset,
    });
  };

  const webglErrorCard = (
    <div className="flex min-h-[440px] items-center justify-center rounded-3xl border border-rose-300/30 bg-rose-950/30 p-6 text-rose-100 shadow-2xl shadow-rose-950/20">
      <div className="max-w-2xl text-center">
        <p className="text-sm uppercase tracking-[0.32em] text-rose-200">WebGL no pudo renderizar</p>
        <h3 className="mt-3 text-2xl font-semibold text-white">El motor matemático se mantuvo seleccionado.</h3>
        <p className="mt-4 rounded-2xl border border-rose-200/15 bg-slate-950/60 p-4 font-mono text-sm text-rose-100">
          {webglError ?? 'No hay motivo técnico disponible.'}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={usePixiTemporarily}
            className="rounded-2xl bg-rose-200 px-5 py-3 font-semibold text-rose-950 transition hover:-translate-y-0.5 hover:bg-white"
          >
            Usar PixiJS temporalmente
          </button>
          <button
            type="button"
            onClick={retryWebGL}
            className="rounded-2xl border border-cyan-200/40 px-5 py-3 font-semibold text-cyan-100 transition hover:-translate-y-0.5 hover:bg-cyan-300/10"
          >
            Reintentar WebGL
          </button>
        </div>
      </div>
    </div>
  );

  const finalFallbackCard = (
    <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-rose-300/30 bg-rose-950/30 p-6 text-center text-rose-100 shadow-2xl shadow-rose-950/20">
      No se pudo cargar el render fractal. Revisa consola.
    </div>
  );

  const webglStatus = renderMode === 'math' ? (webglError ? 'error' : 'activo') : 'inactivo';

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <main className="space-y-6">
        <FractalControls
          onEngineChange={changeRenderMode}
          onGenerateRandom={generateRandomFractal}
          onRemedyChange={updateRemedy}
          onRetryWebGL={retryWebGL}
          remedyName={selection.remedy.name}
          remedies={premiumRemedies}
          renderMode={renderMode}
          selectedRemedyId={selection.remedy.id}
          showRetryWebGL={renderMode === 'math' && Boolean(webglError)}
        />
        <FractalErrorBoundary fallback={finalFallbackCard}>
          {renderMode === 'math' ? (
            webglError ? (
              webglErrorCard
            ) : (
              <EscapeTimeFractalCanvas
                key={retryToken}
                preset={selection.escapePreset}
                onRendererError={(error) => setWebglError(getErrorMessage(error))}
              />
            )
          ) : (
            <FractalPixiCanvas renderInput={renderInput} />
          )}
        </FractalErrorBoundary>
      </main>
      <ParameterPanel escapePreset={selection.escapePreset} renderInput={renderInput} renderMode={renderMode} webglStatus={webglStatus} />
    </div>
  );
}
