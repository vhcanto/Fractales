import { fractalTypeLabels, type EscapeTimePreset } from '../lib/fractal/escape-time/presets/escapeTimePresets';
import type { ComplexPoint } from '../lib/fractal/escape-time/camera/fractalCamera';

interface ParameterPanelProps {
  escapePreset: EscapeTimePreset;
  complexPoint: ComplexPoint | null;
  webglStatus: 'activo' | 'error';
}

const formatNumber = (value: number, digits = 6) => {
  if (!Number.isFinite(value)) return '—';
  if (Math.abs(value) >= 10_000 || Math.abs(value) < 0.0001) return value.toExponential(4);
  return value.toFixed(digits);
};

export function ParameterPanel({ escapePreset, complexPoint, webglStatus }: ParameterPanelProps) {
  return (
    <aside className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 xl:sticky xl:top-6">
      <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Panel simplificado</p>
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
            <p className="text-slate-500">Iteraciones</p>
            <p className="mt-1 font-semibold text-cyan-200">{escapePreset.maxIterations}</p>
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
            <p className="text-slate-500">Cursor Re(c)</p>
            <p className="mt-1 font-mono text-xs font-semibold text-white">{complexPoint ? formatNumber(complexPoint.x, 9) : '—'}</p>
          </div>
          <div className="rounded-2xl bg-white/[0.04] p-4">
            <p className="text-slate-500">Cursor Im(c)</p>
            <p className="mt-1 font-mono text-xs font-semibold text-white">{complexPoint ? formatNumber(complexPoint.y, 9) : '—'}</p>
          </div>
        </div>
        <div className="rounded-2xl bg-white/[0.04] p-4">
          <p className="text-slate-500">Estado WebGL</p>
          <p className={`mt-1 font-semibold ${webglStatus === 'error' ? 'text-rose-200' : 'text-emerald-200'}`}>{webglStatus}</p>
        </div>
        <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/10 p-4 text-cyan-50">
          <p className="font-semibold">Instrucciones</p>
          <ul className="mt-2 space-y-1 text-slate-300">
            <li>Scroll: zoom</li>
            <li>Arrastrar: mover</li>
            <li>Doble clic: acercar</li>
            <li>Reset: volver</li>
          </ul>
        </div>
      </section>
    </aside>
  );
}
