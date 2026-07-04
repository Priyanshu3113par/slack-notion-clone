import { Link } from 'react-router-dom';

const MarketingPageShell = ({ title, subtitle }: { title: string; subtitle: string }) => {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.16),_transparent_24%),radial-gradient(circle_at_80%_10%,_rgba(56,189,248,0.12),_transparent_18%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_30%,_#f8fafc_100%)] text-slate-950 flex flex-col">
      <div className="relative mx-auto w-full max-w-7xl px-6 py-8 sm:px-8 lg:px-10 flex-1 flex flex-col">
        <nav className="flex items-center justify-between gap-4 rounded-full border border-slate-200 bg-white/90 px-5 py-4 shadow-lg shadow-slate-200/50 backdrop-blur-xl">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-600 to-cyan-500 text-lg font-bold text-white">D</div>
            <div>
              <p className="text-sm font-semibold text-slate-950">CollabHub</p>
              <p className="text-xs text-slate-500">Workspace platform</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-950">Log in</Link>
            <Link
              to="/register"
              className="rounded-full bg-gradient-to-r from-indigo-600 via-sky-500 to-cyan-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-300/40 transition hover:opacity-95"
            >
              Start free
            </Link>
          </div>
        </nav>

        <main className="flex-1 flex flex-col items-center justify-center text-center py-20">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm mb-8">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
            Coming Soon
          </div>
          <h1 className="text-5xl font-semibold tracking-tight text-slate-950 sm:text-7xl mb-6">{title}</h1>
          <p className="max-w-2xl text-xl leading-9 text-slate-600 mb-10">{subtitle}</p>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-2xl bg-white border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            ← Back to Home
          </Link>
        </main>
      </div>
    </div>
  );
};

export default MarketingPageShell;
