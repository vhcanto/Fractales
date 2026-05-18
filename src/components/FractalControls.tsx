import { fractalTypeLabels, type EscapeTimeFractalType } from '../lib/fractal/escape-time/presets/escapeTimePresets';

interface FractalControlsProps {
  selectedFractalType: EscapeTimeFractalType;
  onFractalTypeChange: (fractalType: EscapeTimeFractalType) => void;
  onRegenerateView: () => void;
  onResetView: () => void;
  showRetryWebGL?: boolean;
  onRetryWebGL: () => void;
}

const fractalTypes: EscapeTimeFractalType[] = ['mandelbrot', 'julia', 'burningShip'];

export function FractalControls({
  selectedFractalType,
  onFractalTypeChange,
  onRegenerateView,
  onResetView,
  onRetryWebGL,
  showRetryWebGL = false,
}: FractalControlsProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-glow">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Fractal Renderer Lab · v05-18-08</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Fractal Renderer Lab</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Exploración matemática WebGL de fractales escape-time reales con cámara interactiva, suavizado y paletas calibradas.
          </p>
          <p className="mt-3 inline-flex rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">
            Render matemático WebGL
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
            onClick={onRegenerateView}
            className="rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-300 hover:shadow-lg hover:shadow-cyan-500/25 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            Regenerar vista
          </button>
          <button
            type="button"
            onClick={onResetView}
            className="rounded-2xl border border-white/15 px-5 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            Reset vista
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-[minmax(0,420px)]">
        <label className="space-y-2 text-sm font-medium text-slate-200">
          <span>Tipo de fractal</span>
          <select
            value={selectedFractalType}
            onChange={(event) => onFractalTypeChange(event.target.value as EscapeTimeFractalType)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/20"
          >
            {fractalTypes.map((fractalType) => (
              <option key={fractalType} value={fractalType}>
                {fractalTypeLabels[fractalType]}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
