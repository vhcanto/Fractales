import type { FractalRenderInput } from '../types/fractal';

interface ParameterPanelProps {
  renderInput: FractalRenderInput;
}

const labelMap: Record<string, string> = {
  energia: 'Energía',
  dispersion: 'Dispersión',
  repeticion: 'Repetición',
  inestabilidad: 'Inestabilidad',
  densidad: 'Densidad',
  simetria: 'Simetría',
};

export function ParameterPanel({ renderInput }: ParameterPanelProps) {
  const { remedyName, preset, originalParameters, visualParameters } = renderInput;

  return (
    <aside className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 xl:sticky xl:top-6">
      <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Parámetros</p>
      <h3 className="mt-2 text-xl font-semibold text-white">Datos usados</h3>

      <section className="mt-6 space-y-2 rounded-2xl bg-white/[0.04] p-4">
        <p className="text-xs uppercase text-slate-500">Medicamento seleccionado</p>
        <p className="font-semibold text-white">{remedyName}</p>
        <p className="text-xs uppercase text-slate-500">Preset fractal usado</p>
        <p className="font-semibold text-cyan-200">{preset.name}</p>
        <p className="text-sm leading-6 text-slate-400">{preset.description}</p>
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
        <h4 className="font-semibold text-white">Parámetros visuales generados</h4>
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
