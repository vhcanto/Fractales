import { getFractalPalette } from '../lib/fractal/escape-time/palettes/fractalPalettes';
import { fractalTypeLabels, type EscapeTimePreset } from '../lib/fractal/escape-time/presets/escapeTimePresets';
import type { FractalRenderMode } from './FractalControls';
import type { FractalRenderInput } from '../types/fractal';

interface ParameterPanelProps {
  escapePreset: EscapeTimePreset;
  renderInput: FractalRenderInput;
  renderMode: FractalRenderMode;
  webglStatus: 'activo' | 'error' | 'inactivo';
}

const renderModeLabels: Record<FractalRenderMode, string> = {
  math: 'Render matemático WebGL',
  premium: 'Render premium PixiJS',
  basic: 'Render básico Canvas · emergencia interna',
};

export function ParameterPanel({ escapePreset, renderInput, renderMode, webglStatus }: ParameterPanelProps) {
  const palette = getFractalPalette(escapePreset.colorPalette);
  const quality = escapePreset.maxIterations >= 1000 || escapePreset.zoom >= 1000 ? 'ultra' : 'alta';

  return (
    <aside className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 xl:sticky xl:top-6">
      <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Panel simplificado</p>
      <h3 className="mt-2 text-xl font-semibold text-white">Estado visual</h3>

      <section className="mt-6 grid gap-3 text-sm">
        <div className="rounded-2xl bg-white/[0.04] p-4">
          <p className="text-slate-500">Medicamento seleccionado</p>
          <p className="mt-1 font-semibold text-white">{renderInput.remedyName}</p>
        </div>
        <div className="rounded-2xl bg-white/[0.04] p-4">
          <p className="text-slate-500">Motor activo</p>
          <p className="mt-1 font-semibold text-cyan-200">{renderModeLabels[renderMode]}</p>
        </div>
        <div className="rounded-2xl bg-white/[0.04] p-4">
          <p className="text-slate-500">Tipo fractal</p>
          <p className="mt-1 font-semibold text-cyan-200">{fractalTypeLabels[escapePreset.fractalType]}</p>
        </div>
        <div className="rounded-2xl bg-white/[0.04] p-4">
          <p className="text-slate-500">Paleta</p>
          <p className="mt-1 font-semibold text-cyan-200">{palette.name}</p>
        </div>
        <div className="rounded-2xl bg-white/[0.04] p-4">
          <p className="text-slate-500">Calidad</p>
          <p className="mt-1 font-semibold uppercase tracking-[0.22em] text-cyan-200">{quality}</p>
        </div>
        <div className="rounded-2xl bg-white/[0.04] p-4">
          <p className="text-slate-500">Estado WebGL</p>
          <p className={`mt-1 font-semibold ${webglStatus === 'error' ? 'text-rose-200' : 'text-emerald-200'}`}>{webglStatus}</p>
        </div>
      </section>
    </aside>
  );
}
