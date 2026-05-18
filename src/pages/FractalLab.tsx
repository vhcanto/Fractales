import { useMemo, useState } from 'react';
import { EscapeTimeFractalCanvas } from '../components/EscapeTimeFractalCanvas';
import { FractalCanvas } from '../components/FractalCanvas';
import { FractalControls, type FractalRenderMode } from '../components/FractalControls';
import { FractalErrorBoundary } from '../components/FractalErrorBoundary';
import { FractalPixiCanvas } from '../components/FractalPixiCanvas';
import { ParameterPanel } from '../components/ParameterPanel';
import { fractalPresets } from '../data/fractalPresets';
import { remedies } from '../data/remedies';
import {
  escapeTimePresets,
  getEscapeTimePresetById,
  getEscapeTimePresetByRemedyId,
  type EscapeTimePreset,
} from '../lib/fractal/escape-time/presets/escapeTimePresets';
import { cloneEscapeTimePreset, jitterPreset } from '../lib/fractal/escape-time/utils/fractalMath';
import { mapRemedyToVisualParams, pickRandomItem } from '../lib/remedyMapper';
import type { FractalPreset, FractalRenderInput } from '../types/fractal';
import type { Remedy } from '../types/remedy';

interface FractalSelection {
  remedy: Remedy;
  legacyPreset: FractalPreset;
  escapePreset: EscapeTimePreset;
}

const premiumRemedyNames = new Set(['aconitum', 'pulsatilla', 'nux-vomica']);

const normalizeRemedyName = (name: string): string =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-');

const hasPremiumFractal = (remedyName: string): boolean => premiumRemedyNames.has(normalizeRemedyName(remedyName));

const defaultRemedy = remedies.find((remedy) => remedy.id === 'aconitum') ?? (remedies[0] as Remedy);
const defaultLegacyPreset = fractalPresets.find((preset) => preset.id === 'dendritic-bloom') ?? (fractalPresets[0] as FractalPreset);

const initialSelection: FractalSelection = {
  remedy: defaultRemedy,
  legacyPreset: defaultLegacyPreset,
  escapePreset: cloneEscapeTimePreset(getEscapeTimePresetByRemedyId(defaultRemedy.id)),
};

export function FractalLab() {
  const [selection, setSelection] = useState<FractalSelection>(initialSelection);
  const [renderMode, setRenderMode] = useState<FractalRenderMode>('math');
  const [pixiUnavailable, setPixiUnavailable] = useState(false);
  const [allRenderersFailed, setAllRenderersFailed] = useState(false);

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
    const remedy = remedies.find((item) => item.id === remedyId);
    if (!remedy) return;
    setPixiUnavailable(false);
    setAllRenderersFailed(false);
    setSelection((current) => ({
      ...current,
      remedy,
      escapePreset: cloneEscapeTimePreset(getEscapeTimePresetByRemedyId(remedy.id)),
    }));
  };

  const updateEscapePreset = (presetId: string) => {
    setSelection((current) => ({
      ...current,
      escapePreset: cloneEscapeTimePreset(getEscapeTimePresetById(presetId)),
    }));
  };

  const updateIterations = (maxIterations: number) => {
    setSelection((current) => ({
      ...current,
      escapePreset: { ...current.escapePreset, maxIterations },
    }));
  };

  const updateZoom = (zoom: number) => {
    setSelection((current) => ({
      ...current,
      escapePreset: { ...current.escapePreset, zoom },
    }));
  };

  const resetPreset = () => {
    setSelection((current) => ({
      ...current,
      escapePreset: cloneEscapeTimePreset(getEscapeTimePresetById(current.escapePreset.id)),
    }));
  };

  const generateRandomFractal = () => {
    const remedy = pickRandomItem(remedies);
    const escapePreset = jitterPreset(getEscapeTimePresetByRemedyId(remedy.id));
    setPixiUnavailable(false);
    setAllRenderersFailed(false);
    setSelection({
      remedy,
      legacyPreset: pickRandomItem(fractalPresets.filter((preset) => preset.id !== 'neural-spiral') || fractalPresets),
      escapePreset,
    });
  };

  const isPremiumSelection = hasPremiumFractal(selection.remedy.name);
  const effectiveRenderMode: FractalRenderMode = renderMode === 'premium' && (!isPremiumSelection || pixiUnavailable) ? 'basic' : renderMode;

  const finalFallbackCard = (
    <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-rose-300/30 bg-rose-950/30 p-6 text-center text-rose-100 shadow-2xl shadow-rose-950/20">
      No se pudo cargar el render fractal. Revisa consola.
    </div>
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <main className="space-y-6">
        <FractalControls
          escapePresetName={selection.escapePreset.name}
          escapePresets={escapeTimePresets}
          iterations={selection.escapePreset.maxIterations}
          maxIterationsLimit={1400}
          minIterationsLimit={120}
          onEngineChange={setRenderMode}
          onGenerateRandom={generateRandomFractal}
          onIterationsChange={updateIterations}
          onPresetChange={updateEscapePreset}
          onRemedyChange={updateRemedy}
          onResetPreset={resetPreset}
          onZoomChange={updateZoom}
          remedyName={selection.remedy.name}
          remedies={remedies}
          renderMode={effectiveRenderMode}
          selectedEscapePresetId={selection.escapePreset.id}
          selectedRemedyId={selection.remedy.id}
          zoom={selection.escapePreset.zoom}
        />
        <FractalErrorBoundary fallback={finalFallbackCard} onError={() => setAllRenderersFailed(true)}>
          {allRenderersFailed ? (
            finalFallbackCard
          ) : effectiveRenderMode === 'math' ? (
            <EscapeTimeFractalCanvas preset={selection.escapePreset} onRendererError={() => setRenderMode('premium')} />
          ) : effectiveRenderMode === 'premium' ? (
            <FractalPixiCanvas renderInput={renderInput} onRendererError={() => setPixiUnavailable(true)} />
          ) : (
            <FractalCanvas renderInput={renderInput} onRendererError={() => setAllRenderersFailed(true)} />
          )}
        </FractalErrorBoundary>
      </main>
      <ParameterPanel escapePreset={selection.escapePreset} renderInput={renderInput} renderMode={effectiveRenderMode} />
    </div>
  );
}
