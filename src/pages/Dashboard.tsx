import { fractalPresets } from '../data/fractalPresets';
import { remedies } from '../data/remedies';

interface DashboardProps {
  onOpenLab: () => void;
}

export function Dashboard({ onOpenLab }: DashboardProps) {
  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-glow">
        <p className="text-sm uppercase tracking-[0.45em] text-cyan-300">SistemaFractales</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-white md:text-6xl">
          Fractal Lab para explorar firmas visuales homeopáticas.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
          Prototipo inicial sin base de datos, login ni captura. Los fractales se generan desde arrays locales, un mapeador de parámetros y un motor Canvas 2D modular.
        </p>
        <button
          type="button"
          onClick={onOpenLab}
          className="mt-8 rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-200"
        >
          Abrir Fractal Lab
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
          <p className="text-3xl font-bold text-white">{remedies.length}</p>
          <p className="mt-1 text-sm text-slate-400">Medicamentos iniciales</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
          <p className="text-3xl font-bold text-white">{fractalPresets.length}</p>
          <p className="mt-1 text-sm text-slate-400">Presets fractales</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
          <p className="text-3xl font-bold text-white">Canvas 2D</p>
          <p className="mt-1 text-sm text-slate-400">Motor visual desacoplado de la UI</p>
        </div>
      </section>
    </div>
  );
}
