import { FractalLab } from './pages/FractalLab';

function App() {
  return (
    <div className="min-h-screen text-slate-100">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6 px-4 py-4 lg:px-6 lg:py-6">
        <header className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-4 shadow-2xl shadow-slate-950/40">
          <div className="flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-cyan-300/20 via-indigo-500/15 to-slate-950 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300 font-black text-slate-950">FR</div>
              <div>
                <h1 className="text-2xl font-bold text-white">Fractal Renderer Lab</h1>
                <p className="mt-1 text-sm text-slate-300">SistemaFractales · v05-18-08</p>
              </div>
            </div>
            <p className="max-w-2xl text-sm text-slate-300">
              Motor fractal WebGL para Mandelbrot, Julia Set y Burning Ship con exploración matemática interactiva.
            </p>
          </div>
        </header>

        <div className="min-w-0 flex-1 py-2 lg:py-0">
          <FractalLab />
        </div>
      </div>
    </div>
  );
}

export default App;
