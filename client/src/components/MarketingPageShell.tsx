import { Link } from 'react-router-dom';

const MarketingPageShell = ({ title, subtitle }: { title: string; subtitle: string }) => {
  return (
    <div className="flex min-h-screen flex-col bg-[#f6f8fb] text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-950 text-sm font-black tracking-[0.18em] text-white">CH</span>
            <span>
              <span className="block text-sm font-black text-slate-950">CollabHub</span>
              <span className="block text-xs font-semibold text-slate-500">Workspace platform</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/login" className="rounded-md border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">Log in</Link>
            <Link to="/register" className="rounded-md bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800">Start free</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 items-center px-6 py-16 lg:px-8">
        <section className="grid w-full gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-sky-700">Product area</p>
            <h1 className="mt-5 text-5xl font-black leading-tight text-slate-950 sm:text-6xl">{title}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">{subtitle}</p>
            <Link to="/" className="mt-7 inline-flex rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-800 hover:bg-slate-50">
              Back to home
            </Link>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xl">
            <div className="grid gap-3 sm:grid-cols-2">
              {['Workspaces', 'Channels', 'Documents', 'Realtime'].map((item) => (
                <div key={item} className="rounded-md border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-black text-slate-950">{item}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Designed for fast-moving teams and production SaaS workflows.</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default MarketingPageShell;
