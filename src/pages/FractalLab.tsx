import { useMemo, useState } from 'react';
import { FractalCanvas } from '../components/FractalCanvas';
import { FractalControls } from '../components/FractalControls';
import { ParameterPanel } from '../components/ParameterPanel';
import { fractalPresets } from '../data/fractalPresets';
import { remedies } from '../data/remedies';
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

  const renderInput = useMemo<FractalRenderInput>(() => {
    const visualParameters = mapRemedyToVisualParams(selection.remedy, selection.preset);

    return {
      remedyName: selection.remedy.name,
      preset: selection.preset,
      originalParameters: selection.remedy.parameters,
      visualParameters,
    };
  }, [selection]);

  const generateRandomFractal = () => {
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
          remedyName={selection.remedy.name}
          presetName={selection.preset.name}
        />
        <FractalCanvas renderInput={renderInput} />
      </main>
      <ParameterPanel renderInput={renderInput} />
    </div>
  );
}
