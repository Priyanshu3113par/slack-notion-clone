import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface AuthPageShellProps {
  title: string;
  description: string;
  children: ReactNode;
  actionText: string;
  actionLink: string;
  actionLabel: string;
}

const AuthPageShell = ({ title, description, children, actionText, actionLink, actionLabel }: AuthPageShellProps) => {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.12),_transparent_24%),radial-gradient(circle_at_95%_20%,_rgba(56,189,248,0.1),_transparent_18%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_38%,_#f8fafc_100%)] text-slate-950">
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col gap-10 px-6 py-8 sm:px-8 lg:px-10">
        <nav className="flex flex-wrap items-center justify-between gap-4 rounded-full border border-slate-200 bg-white/90 px-5 py-4 shadow-lg shadow-slate-200/50 backdrop-blur-xl">
          <Link to="/" className="flex items-center gap-3 text-lg font-semibold text-slate-950">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-600 to-sky-500 text-white">D</div>
            CollabHub
          </Link>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <Link to="/login" className="rounded-full px-4 py-2 transition hover:text-slate-950">Log in</Link>
            <Link to="/register" className="rounded-full bg-gradient-to-r from-indigo-600 via-sky-500 to-cyan-500 px-5 py-2 font-semibold text-white shadow-lg shadow-slate-300/40 transition hover:opacity-95">Get Started</Link>
          </div>
        </nav>

        <div className="grid gap-10 xl:grid-cols-[1.05fr_0.95fr] xl:items-center">
          <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-[0_40px_120px_rgba(15,23,42,0.08)] sm:p-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-700 shadow-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
              Secure onboarding for your team
            </div>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">{title}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">{description}</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {['Workspaces', 'Channels', 'Documents', 'Live chat'].map((feature) => (
                <div key={feature} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-indigo-600">{feature}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">Designed for teams who want speed, clarity, and real-time coordination.</p>
                </div>
              ))}
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {['Two-factor auth', 'Instant invites', 'Realtime sync', 'Custom workspaces'].map((benefit) => (
                <div key={benefit} className="rounded-3xl bg-slate-100 px-4 py-3 text-sm text-slate-600">{benefit}</div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-[0_40px_120px_rgba(15,23,42,0.08)] sm:p-10">
            <div className="mb-8 text-center text-sm uppercase tracking-[0.24em] text-indigo-600">Welcome back</div>
            {children}
            <p className="mt-6 text-center text-sm text-slate-600">
              {actionText}{' '}
              <Link to={actionLink} className="font-semibold text-indigo-600 hover:text-indigo-700">
                {actionLabel}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPageShell;
