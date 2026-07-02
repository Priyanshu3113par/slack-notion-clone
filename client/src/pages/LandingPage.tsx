import { Link } from 'react-router-dom';

const LandingPage = () => {
  const features = [
    {
      title: 'Realtime collaboration',
      description: 'Instant chat, presence, and channel workflows for teams that move fast.'
    },
    {
      title: 'Modern workspace',
      description: 'Organize projects, docs, and channels in a polished, easy-to-use interface.'
    },
    {
      title: 'Secure by default',
      description: 'Workspace access controls, secure auth, and encrypted session handling.'
    },
    {
      title: 'Built for scale',
      description: 'Fast Socket.IO sync, MongoDB persistence, and resilient team workflows.'
    }
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.16),_transparent_24%),radial-gradient(circle_at_80%_10%,_rgba(56,189,248,0.12),_transparent_18%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_30%,_#f8fafc_100%)] text-slate-950">
      <div className="relative mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-10">
        <nav className="flex flex-wrap items-center justify-between gap-4 rounded-full border border-slate-200 bg-white/90 px-5 py-4 shadow-lg shadow-slate-200/50 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-600 to-cyan-500 text-lg font-bold text-white">D</div>
            <div>
              <p className="text-sm font-semibold text-slate-950">CollabHub</p>
              <p className="text-xs text-slate-500">Workspace platform</p>
            </div>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            {['Product', 'Features', 'Solutions', 'Pricing', 'Company'].map((item) => (
              <button key={item} className="text-sm font-medium text-slate-600 transition hover:text-slate-950">{item}</button>
            ))}
          </div>
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

        <section className="grid gap-10 py-12 xl:grid-cols-[0.95fr_1.05fr] xl:items-center xl:gap-14">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-700 shadow-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
              Teams love the speed of live collaboration.
            </div>
            <div className="space-y-6">
              <h1 className="text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">A premium workspace built for teams who need speed, clarity, and focus.</h1>
              <p className="max-w-2xl text-xl leading-9 text-slate-600">CollabHub combines channels, message threads, documents, and live presence into one modern control center that looks and feels polished.</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-slate-300/25 transition hover:bg-slate-800"
              >
                Start free trial
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-950 shadow-sm transition hover:border-slate-400"
              >
                View demo
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {['No credit card required', 'Deploy in minutes', 'Unlimited workspaces'].map((item) => (
                <div key={item} className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">{item}</div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2.25rem] border border-slate-200 bg-white shadow-[0_45px_140px_rgba(15,23,42,0.08)]">
            <div className="absolute -top-10 left-8 h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 opacity-20 blur-3xl" />
            <div className="absolute -bottom-10 right-8 h-28 w-28 rounded-full bg-gradient-to-br from-sky-300 to-indigo-300 opacity-20 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2.25rem] bg-slate-950 text-slate-100">
              <div className="border-b border-slate-800 px-6 py-4">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span># product</span>
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    12 online
                  </span>
                </div>
              </div>
              <div className="px-6 py-6 sm:px-8 sm:py-8">
                <div className="mb-6 rounded-[1.75rem] border border-slate-800 bg-slate-900 p-4 shadow-inner shadow-slate-950/30">
                  <div className="mb-4 flex items-center justify-between text-sm text-slate-400">
                    <span># general</span>
                    <span>12K</span>
                  </div>
                  <div className="space-y-4">
                    {[
                      {
                        user: 'Priyanshu',
                        time: '10:30 AM',
                        line: "Good morning team! Today's focus: ship chat, docs, and task updates."
                      },
                      {
                        user: 'Sneha',
                        time: '10:32 AM',
                        line: "I’ll polish the interface and add spacing to the new dashboard."

                      },
                      {
                        user: 'Rohit',
                        time: '10:35 AM',
                        line: 'Realtime sync is live. Test it with a second browser tab.'
                      }
                    ].map((message) => (
                      <div key={message.user} className="rounded-3xl border border-slate-800 bg-slate-950/90 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-500 text-lg font-semibold text-slate-950">{message.user.charAt(0)}</div>
                            <div>
                              <p className="font-semibold text-white">{message.user}</p>
                              <p className="text-xs text-slate-500">{message.time}</p>
                            </div>
                          </div>
                          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">Live</span>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-300">{message.line}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 rounded-3xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-400">Sneha and Rohit are typing…</div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { label: 'Workspace members', value: '42' },
                    { label: 'Active channels', value: '9' },
                    { label: 'Open documents', value: '27' },
                    { label: 'Unreads', value: '14' }
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
                      <p className="text-xs uppercase tracking-[0.28em] text-slate-400">{stat.label}</p>
                      <p className="mt-2 text-2xl font-semibold text-white">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-[2rem] border border-slate-200 bg-white px-6 py-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-indigo-600">{feature.title}</p>
              <p className="mt-4 text-sm leading-7 text-slate-600">{feature.description}</p>
            </div>
          ))}
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white px-6 py-8 shadow-[0_30px_90px_rgba(15,23,42,0.08)]">
          <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Trusted by fast-moving teams</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {['Acme', 'Layer', 'Pulse', 'Sitemark', 'Catalog'].map((brand) => (
              <div key={brand} className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">{brand}</div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default LandingPage;
