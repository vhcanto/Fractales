import { useMemo, useState } from 'react';
import { FractalCanvas } from '../components/FractalCanvas';
import { FractalControls } from '../components/FractalControls';
import { FractalPixiCanvas } from '../components/FractalPixiCanvas';
import { ParameterPanel } from '../components/ParameterPanel';
import { fractalPresets } from '../data/fractalPresets';
import { remedies } from '../data/remedies';
import { hasPremiumFractal } from '../lib/fractal/pixi/PixiFractalRenderer';
import { mapRemedyToVisualParams, pickRandomItem } from '../lib/remedyMapper';
import type { FractalPreset, FractalRenderInput } from '../types/fractal';
import type { Remedy } from '../types/remedy';

interface FractalSelection {
  remedy: Remedy;
  preset: FractalPreset;
}

const initialSelection: FractalSelection = {
  remedy: remedies[0] as Remedy,
  preset: fractalPresets[0] as FractalPreset,
};

export function FractalLab() {
  const [selection, setSelection] = useState<FractalSelection>(initialSelection);
  const [pixiUnavailable, setPixiUnavailable] = useState(false);

  const renderInput = useMemo<FractalRenderInput>(() => {
    const visualParameters = mapRemedyToVisualParams(selection.remedy, selection.preset);

    return {
      remedyName: selection.remedy.name,
      preset: selection.preset,
      originalParameters: selection.remedy.parameters,
      visualParameters,
    };
  }, [selection]);

  const isPremiumSelection = hasPremiumFractal(selection.remedy.name);
  const shouldUsePremiumRenderer = isPremiumSelection && !pixiUnavailable;

  const updateRemedy = (remedyId: string) => {
    const remedy = remedies.find((item) => item.id === remedyId);
    if (!remedy) return;
    setPixiUnavailable(false);
    setSelection((current) => ({ ...current, remedy }));
  };

  const updatePreset = (presetId: string) => {
    const preset = fractalPresets.find((item) => item.id === presetId);
    if (!preset) return;
    setSelection((current) => ({ ...current, preset }));
  };

  const generateRandomFractal = () => {
    setPixiUnavailable(false);
    setSelection({
      remedy: pickRandomItem(remedies),
      preset: pickRandomItem(fractalPresets),
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <main className="space-y-6">
        <FractalControls
          onGenerateRandom={generateRandomFractal}
          onPresetChange={updatePreset}
          onRemedyChange={updateRemedy}
          presetName={selection.preset.name}
          presets={fractalPresets}
          remedyName={selection.remedy.name}
          remedies={remedies}
          renderMode={shouldUsePremiumRenderer ? 'premium' : 'basic'}
          selectedPresetId={selection.preset.id}
          selectedRemedyId={selection.remedy.id}
        />
        {shouldUsePremiumRenderer ? (
          <FractalPixiCanvas renderInput={renderInput} onRendererError={() => setPixiUnavailable(true)} />
        ) : (
          <FractalCanvas renderInput={renderInput} />
        )}
      </main>
      <ParameterPanel renderInput={renderInput} />
    </div>
  );
}
