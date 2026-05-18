import type { EscapeTimePreset } from '../lib/fractal/escape-time/presets/escapeTimePresets';
import type { Remedy } from '../types/remedy';

export type FractalRenderMode = 'math' | 'premium' | 'basic';

interface FractalControlsProps {
  escapePresetName: string;
  escapePresets: EscapeTimePreset[];
  iterations: number;
  maxIterationsLimit: number;
  minIterationsLimit: number;
  onEngineChange: (mode: FractalRenderMode) => void;
  onGenerateRandom: () => void;
  onIterationsChange: (iterations: number) => void;
  onPresetChange: (presetId: string) => void;
  onRemedyChange: (remedyId: string) => void;
  onResetPreset: () => void;
  onZoomChange: (zoom: number) => void;
  remedyName: string;
  remedies: Remedy[];
  renderMode: FractalRenderMode;
  selectedEscapePresetId: string;
  selectedRemedyId: string;
  zoom: number;
}

const modeLabels: Record<FractalRenderMode, string> = {
  math: 'Render matemático WebGL',
  premium: 'Render premium PixiJS',
  basic: 'Render básico Canvas · fallback',
};

export function FractalControls({
  escapePresetName,
  escapePresets,
  iterations,
  maxIterationsLimit,
  minIterationsLimit,
  onEngineChange,
  onGenerateRandom,
  onIterationsChange,
  onPresetChange,
  onRemedyChange,
  onResetPreset,
  onZoomChange,
  remedyName,
  remedies,
  renderMode,
  selectedEscapePresetId,
  selectedRemedyId,
  zoom,
}: FractalControlsProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-glow">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Fractal activo</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{remedyName}</h2>
          <p className="text-sm text-slate-400">Preset matemático: {escapePresetName}</p>
          <p className="mt-3 inline-flex rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">
            {modeLabels[renderMode]}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onResetPreset}
            className="rounded-2xl border border-white/10 px-5 py-3 font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:border-cyan-300/50 hover:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            Reset preset
          </button>
          <button
            type="button"
            onClick={onGenerateRandom}
            className="rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-300 hover:shadow-lg hover:shadow-cyan-500/25 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            Regenerar
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
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
          <span>Motor visual</span>
          <select
            value={renderMode}
            onChange={(event) => onEngineChange(event.target.value as FractalRenderMode)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/20"
          >
            <option value="math">Render matemático WebGL</option>
            <option value="premium">Render premium PixiJS</option>
            <option value="basic">Render básico Canvas · fallback</option>
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-200">
          <span>Preset fractal matemático</span>
          <select
            value={selectedEscapePresetId}
            onChange={(event) => onPresetChange(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/20"
          >
            {escapePresets.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm font-medium text-slate-200">
          <div className="mb-3 flex items-center justify-between">
            <span>Iteraciones</span>
            <span className="font-mono text-cyan-200">{iterations}</span>
          </div>
          <input
            type="range"
            min={minIterationsLimit}
            max={maxIterationsLimit}
            step={10}
            value={iterations}
            onChange={(event) => onIterationsChange(Number(event.target.value))}
            className="w-full accent-cyan-300"
          />
        </label>

        <label className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm font-medium text-slate-200">
          <div className="mb-3 flex items-center justify-between">
            <span>Zoom</span>
            <span className="font-mono text-cyan-200">{zoom.toFixed(2)}×</span>
          </div>
          <input
            type="range"
            min={Math.log2(0.6)}
            max={Math.log2(4200)}
            step={0.02}
            value={Math.log2(zoom)}
            onChange={(event) => onZoomChange(2 ** Number(event.target.value))}
            className="w-full accent-cyan-300"
          />
        </label>
      </div>
    </div>
  );
}
