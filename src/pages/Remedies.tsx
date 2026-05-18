import { RemedyCard } from '../components/RemedyCard';
import { remedies } from '../data/remedies';

export function Remedies() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Catálogo local</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Medicamentos</h1>
        <p className="mt-2 max-w-2xl text-slate-400">
          Datos fijos definidos en arrays para esta primera etapa. Más adelante esta capa podrá reemplazarse por Firestore, Supabase u otra fuente persistente.
        </p>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {remedies.map((remedy) => (
          <RemedyCard key={remedy.id} remedy={remedy} />
        ))}
      </div>
    </div>
  );
}
