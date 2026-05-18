import type { Remedy } from '../types/remedy';

interface RemedyCardProps {
  remedy: Remedy;
}

export function RemedyCard({ remedy }: RemedyCardProps) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 transition hover:-translate-y-1 hover:border-cyan-300/40 hover:bg-white/[0.07]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-white">{remedy.name}</h3>
          <p className="text-sm italic text-cyan-200/80">{remedy.latinName}</p>
        </div>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">{remedy.family}</span>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-300">{remedy.shortDescription}</p>
      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        {Object.entries(remedy.parameters).map(([key, value]) => (
          <div key={key} className="rounded-2xl bg-slate-950/70 p-3">
            <p className="capitalize text-slate-500">{key}</p>
            <p className="mt-1 font-semibold text-cyan-200">{value}</p>
          </div>
        ))}
      </div>
    </article>
  );
}
