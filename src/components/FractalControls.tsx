import type { FractalPreset } from '../types/fractal';
import type { Remedy } from '../types/remedy';

interface FractalControlsProps {
  onGenerateRandom: () => void;
  onPresetChange: (presetId: string) => void;
  onRemedyChange: (remedyId: string) => void;
  presetName: string;
  presets: FractalPreset[];
  remedyName: string;
  remedies: Remedy[];
  renderMode: 'premium' | 'basic';
  selectedPresetId: string;
  selectedRemedyId: string;
}

export function FractalControls({
  onGenerateRandom,
  onPresetChange,
  onRemedyChange,
  presetName,
  presets,
  remedyName,
  remedies,
  renderMode,
  selectedPresetId,
  selectedRemedyId,
}: FractalControlsProps) {
  const modeLabel = renderMode === 'premium' ? 'Render premium PixiJS' : 'Render básico Canvas';

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-glow">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Fractal activo</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{remedyName}</h2>
          <p className="text-sm text-slate-400">Preset: {presetName}</p>
          <p className="mt-3 inline-flex rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">
            {modeLabel}
          </p>
        </div>
        <button
          type="button"
          onClick={onGenerateRandom}
          className="rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-300 hover:shadow-lg hover:shadow-cyan-500/25 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:ring-offset-2 focus:ring-offset-slate-950"
        >
          Generar fractal aleatorio
        </button>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-slate-200">
          <span>Medicamento</span>
          <select
            value={selectedRemedyId}
            onChange={(event) => onRemedyChange(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/20"
          >
            {remedies.map((remedy) => (
              <option key={remedy.id} value={remedy.id}>
                {remedy.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-200">
          <span>Preset visual</span>
          <select
            value={selectedPresetId}
            onChange={(event) => onPresetChange(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/20"
          >
            {presets.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
