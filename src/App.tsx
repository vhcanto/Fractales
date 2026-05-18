import { useState } from 'react';
import { Dashboard } from './pages/Dashboard';
import { FractalLab } from './pages/FractalLab';
import { Remedies } from './pages/Remedies';

type Page = 'dashboard' | 'fractal-lab' | 'remedies';

const navigation: Array<{ id: Page; label: string; description: string }> = [
  { id: 'dashboard', label: 'Dashboard', description: 'Resumen' },
  { id: 'fractal-lab', label: 'Fractal Lab', description: 'Canvas generativo' },
  { id: 'remedies', label: 'Medicamentos', description: 'Arrays locales' },
];

function App() {
  const [activePage, setActivePage] = useState<Page>('dashboard');

  const renderPage = () => {
    if (activePage === 'fractal-lab') return <FractalLab />;
    if (activePage === 'remedies') return <Remedies />;
    return <Dashboard onOpenLab={() => setActivePage('fractal-lab')} />;
  };

  return (
    <div className="min-h-screen text-slate-100">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6 px-4 py-4 lg:flex-row lg:px-6 lg:py-6">
        <aside className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-4 shadow-2xl shadow-slate-950/40 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-72">
          <div className="rounded-3xl bg-gradient-to-br from-cyan-300/20 to-indigo-500/20 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300 font-black text-slate-950">FL</div>
            <h1 className="mt-4 text-2xl font-bold text-white">Fractal Lab</h1>
            <p className="mt-1 text-sm text-slate-300">SistemaFractales · v05-18-01</p>
          </div>

          <nav className="mt-6 space-y-2" aria-label="Navegación principal">
            {navigation.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActivePage(item.id)}
                  className={`w-full rounded-2xl px-4 py-3 text-left transition ${
                    isActive
                      ? 'bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-500/20'
                      : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <span className="block font-semibold">{item.label}</span>
                  <span className={`text-xs ${isActive ? 'text-slate-800' : 'text-slate-500'}`}>{item.description}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0 flex-1 py-2 lg:py-0">{renderPage()}</div>
      </div>
    </div>
  );
}

export default App;
