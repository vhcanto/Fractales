interface FractalControlsProps {
  onGenerateRandom: () => void;
  remedyName: string;
  presetName: string;
}

export function FractalControls({ onGenerateRandom, remedyName, presetName }: FractalControlsProps) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-glow sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Fractal activo</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">{remedyName}</h2>
        <p className="text-sm text-slate-400">Preset: {presetName}</p>
      </div>
      <button
        type="button"
        onClick={onGenerateRandom}
        className="rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-300 hover:shadow-lg hover:shadow-cyan-500/25 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:ring-offset-2 focus:ring-offset-slate-950"
      >
        Generar fractal aleatorio
      </button>
    </div>
  );
}
