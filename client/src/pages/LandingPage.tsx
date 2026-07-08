import { Link } from 'react-router-dom';

const metrics = [
  { label: 'Active teams', value: '128' },
  { label: 'Live channels', value: '840' },
  { label: 'Docs updated', value: '18k' },
  { label: 'Avg response', value: '42ms' }
];

const workflow = [
  {
    title: 'Channels',
    description: 'Focused team rooms for shipping, support, design, and operations.'
  },
  {
    title: 'Documents',
    description: 'Shared markdown notes with autosave, labels, preview mode, and co-editing.'
  },
  {
    title: 'Presence',
    description: 'Online users and realtime typing signals powered by Socket.IO.'
  },
  {
    title: 'Secure workspaces',
    description: 'JWT auth, workspace membership checks, invite codes, and hashed passwords.'
  }
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-950 text-sm font-black tracking-[0.18em] text-white">
              CH
            </span>
            <span>
              <span className="block text-sm font-black text-slate-950">CollabHub</span>
              <span className="block text-xs font-semibold text-slate-500">Realtime workspace</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {['Product', 'Features', 'Solutions', 'Pricing', 'Company'].map((item) => (
              <Link key={item} to={`/${item.toLowerCase()}`} className="text-sm font-bold text-slate-500 hover:text-slate-950">
                {item}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/login" className="rounded-md border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
              Log in
            </Link>
            <Link to="/register" className="rounded-md bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800">
              Start free
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:px-8 lg:py-16">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-sky-700">Slack plus Notion for focused teams</p>
            <h1 className="mt-5 text-5xl font-black leading-[1.04] text-slate-950 sm:text-6xl">
              CollabHub
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              A production-ready collaboration workspace with workspaces, channels, realtime chat, shared documents, presence, and secure backend access control.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/register" className="rounded-md bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-slate-800">
                Create workspace
              </Link>
              <Link to="/login" className="rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-800 hover:bg-slate-50">
                Open app
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {['JWT authentication', 'MongoDB persistence', 'Socket.IO realtime sync', 'Redis-ready presence'].map((item) => (
                <div key={item} className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Workspace preview</p>
                <p className="mt-1 text-lg font-black text-slate-950">Product Launch HQ</p>
              </div>
              <span className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">12 online</span>
            </div>

            <div className="grid min-h-[470px] lg:grid-cols-[220px_1fr]">
              <aside className="border-b border-slate-200 bg-slate-950 p-4 text-white lg:border-b-0 lg:border-r">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">Channels</p>
                <div className="mt-3 space-y-1">
                  {['general', 'product', 'engineering', 'support'].map((channel, index) => (
                    <div key={channel} className={`rounded-md px-3 py-2 text-sm font-bold ${index === 1 ? 'bg-white text-slate-950' : 'text-slate-300'}`}>
                      # {channel}
                    </div>
                  ))}
                </div>
                <p className="mt-6 text-xs font-black uppercase tracking-[0.22em] text-slate-500">Documents</p>
                <div className="mt-3 space-y-2">
                  {['Launch brief', 'Sprint plan', 'Customer notes'].map((doc) => (
                    <div key={doc} className="rounded-md border border-white/10 px-3 py-2 text-xs font-bold text-slate-300">
                      {doc}
                    </div>
                  ))}
                </div>
              </aside>

              <section className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-sky-700"># product</p>
                    <h2 className="mt-1 text-xl font-black text-slate-950">Launch coordination</h2>
                  </div>
                  <span className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-black text-slate-500">Live</span>
                </div>

                <div className="space-y-3">
                  {[
                    ['Priyanshu', "Good morning team. Today's focus: ship chat, docs, and task updates."],
                    ['Sneha', 'I will polish the interface and tighten spacing on the dashboard.'],
                    ['Rohit', 'Realtime sync is live. Test it with a second browser tab.']
                  ].map(([name, line]) => (
                    <article key={name} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-sm font-black text-slate-700 shadow-sm">{name[0]}</span>
                        <div>
                          <p className="text-sm font-black text-slate-950">{name}</p>
                          <p className="text-xs text-slate-400">10:3{name.length} AM</p>
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-600">{line}</p>
                    </article>
                  ))}
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-4">
                  {metrics.map((metric) => (
                    <div key={metric.label} className="rounded-md border border-slate-200 bg-white p-3">
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{metric.label}</p>
                      <p className="mt-2 text-xl font-black text-slate-950">{metric.value}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto grid max-w-7xl gap-4 px-6 py-10 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
            {workflow.map((item) => (
              <article key={item.title} className="rounded-md border border-slate-200 bg-white p-5">
                <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-950">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
