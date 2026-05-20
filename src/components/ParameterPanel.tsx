import { fractalTypeLabels, getDepthLevel, type EscapeTimePreset, type RenderStage } from '../lib/fractal/escape-time/presets/escapeTimePresets';
interface ParameterPanelProps {
  escapePreset: EscapeTimePreset;
  webglStatus: 'activo' | 'error';
  renderStatus: RenderStage;
  compact?: boolean;
  engineStats?: {
    stage: RenderStage;
    progress: number;
    fps: number;
    renderMs: number;
    precisionLevel: string;
  };
}

const formatNumber = (value: number, digits = 6) => {
  if (!Number.isFinite(value)) return '—';
  if (Math.abs(value) >= 10_000 || Math.abs(value) < 0.0001) return value.toExponential(4);
  return value.toFixed(digits);
};

export function ParameterPanel({ escapePreset, webglStatus, renderStatus, compact = false, engineStats }: ParameterPanelProps) {
  const depthLevel = getDepthLevel(escapePreset.zoom);

  return (
    <aside className={`rounded-3xl border border-white/10 bg-slate-950/70 p-5 ${compact ? 'h-full overflow-y-auto' : 'xl:sticky xl:top-6'}`}>
      <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Panel de exploración</p>
      <h3 className="mt-2 text-xl font-semibold text-white">Estado WebGL</h3>

      <section className="mt-6 grid gap-3 text-sm">
        <div className="rounded-2xl bg-white/[0.04] p-4">
          <p className="text-slate-500">Tipo de fractal</p>
          <p className="mt-1 font-semibold text-cyan-200">{fractalTypeLabels[escapePreset.fractalType]}</p>
        </div>
        <div className="rounded-2xl bg-white/[0.04] p-4">
          <p className="text-slate-500">Ecuación base</p>
          <p className="mt-1 font-semibold text-white">{escapePreset.equation}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/[0.04] p-4">
            <p className="text-slate-500">Zoom actual</p>
            <p className="mt-1 font-semibold text-cyan-200">{formatNumber(escapePreset.zoom, 3)}×</p>
          </div>
          <div className="rounded-2xl bg-white/[0.04] p-4">
            <p className="text-slate-500">Nivel de profundidad</p>
            <p className="mt-1 font-semibold text-fuchsia-100">{depthLevel}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/[0.04] p-4">
            <p className="text-slate-500">Iteraciones activas</p>
            <p className="mt-1 font-semibold text-cyan-200">{escapePreset.maxIterations}</p>
          </div>
          <div className="rounded-2xl bg-white/[0.04] p-4">
            <p className="text-slate-500">Samples activos</p>
            <p className="mt-1 font-semibold text-white">{escapePreset.samples}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/[0.04] p-4">
            <p className="text-slate-500">Centro X</p>
            <p className="mt-1 font-mono text-xs font-semibold text-white">{formatNumber(escapePreset.centerX, 9)}</p>
          </div>
          <div className="rounded-2xl bg-white/[0.04] p-4">
            <p className="text-slate-500">Centro Y</p>
            <p className="mt-1 font-mono text-xs font-semibold text-white">{formatNumber(escapePreset.centerY, 9)}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/[0.04] p-4">
            <p className="text-slate-500">Estado WebGL</p>
            <p className={`mt-1 font-semibold ${webglStatus === 'error' ? 'text-rose-200' : 'text-emerald-200'}`}>{webglStatus}</p>
          </div>
          <div className="rounded-2xl bg-white/[0.04] p-4">
            <p className="text-slate-500">Render stage</p>
            <p className={`mt-1 font-semibold ${renderStatus !== 'final' ? 'text-amber-200' : 'text-emerald-200'}`}>{renderStatus}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/[0.04] p-4">
            <p className="text-slate-500">Gamma / Contraste</p>
            <p className="mt-1 font-semibold text-cyan-100">{escapePreset.gamma.toFixed(2)} / {escapePreset.contrast.toFixed(2)}</p>
          </div>
          <div className="rounded-2xl bg-white/[0.04] p-4">
            <p className="text-slate-500">Brillo / Saturación</p>
            <p className="mt-1 font-semibold text-cyan-100">{escapePreset.brightness.toFixed(2)} / {escapePreset.saturation.toFixed(2)}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/[0.04] p-4">
            <p className="text-slate-500">Render ms / FPS</p>
            <p className="mt-1 font-semibold text-white">{(engineStats?.renderMs ?? 0).toFixed(2)} / {(engineStats?.fps ?? 0).toFixed(1)}</p>
          </div>
          <div className="rounded-2xl bg-white/[0.04] p-4">
            <p className="text-slate-500">Precision level</p>
            <p className="mt-1 font-semibold text-fuchsia-100">{engineStats?.precisionLevel ?? 'float-32'}</p>
          </div>
        </div>
      </section>
    </aside>
  );
}
