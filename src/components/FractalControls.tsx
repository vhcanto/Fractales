import type { Remedy } from '../types/remedy';

export type FractalRenderMode = 'math' | 'premium' | 'basic';

interface FractalControlsProps {
  onEngineChange: (mode: FractalRenderMode) => void;
  onGenerateRandom: () => void;
  onRemedyChange: (remedyId: string) => void;
  onRetryWebGL?: () => void;
  remedyName: string;
  remedies: Remedy[];
  renderMode: FractalRenderMode;
  selectedRemedyId: string;
  showRetryWebGL?: boolean;
}

const modeLabels: Record<FractalRenderMode, string> = {
  math: 'Render matemático WebGL',
  premium: 'Render premium PixiJS',
  basic: 'Render básico Canvas · emergencia interna',
};

export function FractalControls({
  onEngineChange,
  onGenerateRandom,
  onRemedyChange,
  onRetryWebGL,
  remedyName,
  remedies,
  renderMode,
  selectedRemedyId,
  showRetryWebGL = false,
}: FractalControlsProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-glow">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Fractal Lab · v05-18-06</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{remedyName}</h2>
          <p className="mt-2 text-sm text-slate-400">Modo limpio: calidad gráfica máxima con presets internos calibrados.</p>
          <p className="mt-3 inline-flex rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">
            {modeLabels[renderMode]}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {showRetryWebGL ? (
            <button
              type="button"
              onClick={onRetryWebGL}
              className="rounded-2xl border border-cyan-300/40 px-5 py-3 font-semibold text-cyan-100 transition hover:-translate-y-0.5 hover:bg-cyan-300/10 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              Reintentar WebGL
            </button>
          ) : null}
          <button
            type="button"
            onClick={onGenerateRandom}
            className="rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-300 hover:shadow-lg hover:shadow-cyan-500/25 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            Regenerar
          </button>
        </div>
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
          <span>Motor visual</span>
          <select
            value={renderMode}
            onChange={(event) => onEngineChange(event.target.value as FractalRenderMode)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/20"
          >
            <option value="math">Render matemático WebGL</option>
            <option value="premium">Render premium PixiJS</option>
          </select>
        </label>
      </div>
    </div>
  );
}
