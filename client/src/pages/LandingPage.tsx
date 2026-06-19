import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.24),_transparent_36%)]" />
        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col gap-12 px-6 py-8 sm:px-8 lg:px-10">
          <header className="flex flex-col gap-6 rounded-[2rem] border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/20 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-sky-400">Enterprise collaboration</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">Launch your modern workspace for teams.</h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                Connect teams with channels, documents, tasks, and real-time messaging in one polished SaaS experience.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-2xl bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
                >
                  Start free trial
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-white/10"
                >
                  Login
                </Link>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: 'Workspace creation', value: 'Fast & secure onboarding' },
                { label: 'Channel messaging', value: 'Real-time conversation' },
                { label: 'Document management', value: 'Rich notes & collaboration' },
                { label: 'Task tracking', value: 'Kanban-style workflows' }
              ].map((item) => (
                <div key={item.label} className="rounded-3xl border border-slate-800 bg-slate-950/90 p-5 shadow-lg shadow-slate-950/10">
                  <p className="text-sm uppercase tracking-[0.3em] text-sky-300">{item.label}</p>
                  <p className="mt-3 text-lg font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </header>

          <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[2rem] border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/20">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-sky-400">Why CollaboratePro?</p>
                  <h2 className="mt-2 text-3xl font-semibold text-white">A unified SaaS hub for distributed teams.</h2>
                </div>
                <span className="rounded-2xl bg-slate-800 px-4 py-2 text-sm text-sky-300">Beta-ready</span>
              </div>
              <ul className="space-y-4 text-slate-300">
                <li className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
                  <p className="font-semibold text-white">Workspace management</p>
                  <p className="mt-2 text-sm leading-6">Create multiple workspaces, invite teams, and manage access with secure invite links.</p>
                </li>
                <li className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
                  <p className="font-semibold text-white">Realtime communication</p>
                  <p className="mt-2 text-sm leading-6">Join channels, share messages, and stay synced with live presence updates.</p>
                </li>
                <li className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
                  <p className="font-semibold text-white">Document & task workflows</p>
                  <p className="mt-2 text-sm leading-6">Capture ideas, manage tasks, and keep your team aligned in a single interface.</p>
                </li>
              </ul>
            </div>
            <div className="rounded-[2rem] border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/20">
              <div className="mb-6 flex items-center justify-between gap-4">
                <p className="text-sm uppercase tracking-[0.3em] text-sky-400">Trusted stack</p>
                <span className="rounded-2xl bg-slate-800 px-4 py-2 text-sm text-slate-300">MERN + Tailwind</span>
              </div>
              <div className="grid gap-4">
                {[
                  { label: 'Secure auth', description: 'JWT, bcrypt, and session best practices.' },
                  { label: 'Scalable backend', description: 'Express, MongoDB, Redis and Socket.IO ready.' },
                  { label: 'Modern UI', description: 'Responsive, polished theme with Tailwind v4.' }
                ].map((item) => (
                  <div key={item.label} className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
                    <p className="font-semibold text-white">{item.label}</p>
                    <p className="mt-2 text-sm text-slate-400">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
