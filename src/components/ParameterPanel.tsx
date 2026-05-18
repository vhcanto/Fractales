import { getFractalPalette } from '../lib/fractal/escape-time/palettes/fractalPalettes';
import { fractalTypeLabels, type EscapeTimePreset } from '../lib/fractal/escape-time/presets/escapeTimePresets';
import type { FractalRenderMode } from './FractalControls';
import type { FractalRenderInput } from '../types/fractal';

interface ParameterPanelProps {
  escapePreset: EscapeTimePreset;
  renderInput: FractalRenderInput;
  renderMode: FractalRenderMode;
}

const labelMap: Record<string, string> = {
  energia: 'Energía',
  dispersion: 'Dispersión',
  repeticion: 'Repetición',
  inestabilidad: 'Inestabilidad',
  densidad: 'Densidad',
  simetria: 'Simetría',
};

const renderModeLabels: Record<FractalRenderMode, string> = {
  math: 'Render matemático WebGL',
  premium: 'Render premium PixiJS',
  basic: 'Render básico Canvas · fallback',
};

export function ParameterPanel({ escapePreset, renderInput, renderMode }: ParameterPanelProps) {
  const { remedyName, preset, originalParameters, visualParameters } = renderInput;
  const palette = getFractalPalette(escapePreset.colorPalette);

  return (
    <aside className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 xl:sticky xl:top-6">
      <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Parámetros</p>
      <h3 className="mt-2 text-xl font-semibold text-white">Datos usados</h3>

      <section className="mt-6 space-y-2 rounded-2xl bg-white/[0.04] p-4">
        <p className="text-xs uppercase text-slate-500">Medicamento seleccionado</p>
        <p className="font-semibold text-white">{remedyName}</p>
        <p className="text-xs uppercase text-slate-500">Motor activo</p>
        <p className="font-semibold text-cyan-200">{renderModeLabels[renderMode]}</p>
        <p className="text-xs uppercase text-slate-500">Preset matemático</p>
        <p className="font-semibold text-cyan-200">{escapePreset.name}</p>
        <p className="text-sm leading-6 text-slate-400">{escapePreset.description}</p>
      </section>

      <section className="mt-6">
        <h4 className="font-semibold text-white">Render matemático WebGL</h4>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl bg-white/[0.04] p-3">
            <p className="text-slate-500">Tipo fractal</p>
            <p className="mt-1 font-semibold text-cyan-200">{fractalTypeLabels[escapePreset.fractalType]}</p>
          </div>
          <div className="rounded-2xl bg-white/[0.04] p-3">
            <p className="text-slate-500">Iteraciones</p>
            <p className="mt-1 font-semibold text-cyan-200">{escapePreset.maxIterations}</p>
          </div>
          <div className="rounded-2xl bg-white/[0.04] p-3">
            <p className="text-slate-500">Zoom</p>
            <p className="mt-1 font-semibold text-cyan-200">{escapePreset.zoom.toFixed(2)}×</p>
          </div>
          <div className="rounded-2xl bg-white/[0.04] p-3">
            <p className="text-slate-500">Centro X/Y</p>
            <p className="mt-1 font-semibold text-cyan-200">
              {escapePreset.centerX.toFixed(6)} / {escapePreset.centerY.toFixed(6)}
            </p>
          </div>
          <div className="rounded-2xl bg-white/[0.04] p-3">
            <p className="text-slate-500">Paleta activa</p>
            <p className="mt-1 font-semibold text-cyan-200">{palette.name}</p>
          </div>
          <div className="rounded-2xl bg-white/[0.04] p-3">
            <p className="text-slate-500">Escape radius</p>
            <p className="mt-1 font-semibold text-cyan-200">{escapePreset.escapeRadius}</p>
          </div>
          <div className="rounded-2xl bg-white/[0.04] p-3">
            <p className="text-slate-500">Contraste</p>
            <p className="mt-1 font-semibold text-cyan-200">{escapePreset.contrast.toFixed(2)}</p>
          </div>
          <div className="rounded-2xl bg-white/[0.04] p-3">
            <p className="text-slate-500">Brillo / gamma</p>
            <p className="mt-1 font-semibold text-cyan-200">
              {escapePreset.brightness.toFixed(2)} / {escapePreset.gamma.toFixed(2)}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <h4 className="font-semibold text-white">Parámetros originales</h4>
        <div className="mt-3 space-y-3">
          {Object.entries(originalParameters).map(([key, value]) => (
            <div key={key}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-slate-400">{labelMap[key] ?? key}</span>
                <span className="text-white">{value}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full rounded-full bg-cyan-300" style={{ width: `${value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <h4 className="font-semibold text-white">Fallback Canvas/PixiJS</h4>
        <div className="mt-3 rounded-2xl bg-white/[0.04] p-3 text-sm">
          <p className="text-slate-500">Preset heredado oculto de la experiencia principal</p>
          <p className="mt-1 font-semibold text-cyan-200">{preset.name}</p>
          <p className="mt-2 text-slate-400">{preset.description}</p>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          {Object.entries(visualParameters).map(([key, value]) => (
            <div key={key} className="rounded-2xl bg-white/[0.04] p-3">
              <p className="text-slate-500">{key}</p>
              <p className="mt-1 font-semibold text-cyan-200">{value}</p>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}
