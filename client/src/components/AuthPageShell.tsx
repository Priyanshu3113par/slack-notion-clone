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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.24),_transparent_36%)]" />
        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 sm:px-8 lg:px-10">
          <nav className="flex items-center justify-between">
            <Link to="/" className="text-xl font-semibold tracking-tight text-white">
              CollaboratePro
            </Link>
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <Link to="/login" className="rounded-full border border-slate-700 bg-white/5 px-4 py-2 transition hover:border-slate-500 hover:bg-white/10">
                Login
              </Link>
              <Link to="/register" className="rounded-full bg-sky-500 px-4 py-2 font-semibold text-slate-950 transition hover:bg-sky-400">
                Sign up
              </Link>
            </div>
          </nav>

          <div className="mt-14 grid gap-10 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-10 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">{title}</h1>
              <p className="mt-6 max-w-2xl text-slate-400 leading-8">{description}</p>
              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                {['Workspaces', 'Channels', 'Documents', 'Live chat'].map((feature) => (
                  <div key={feature} className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5 shadow-lg shadow-slate-950/10">
                    <div className="text-sky-300 text-sm font-semibold uppercase tracking-[0.28em]">{feature}</div>
                    <p className="mt-3 text-slate-300 text-sm leading-6">Designed for teams that need a powerful workspace without complexity.</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-800 bg-slate-950/95 p-10 shadow-2xl shadow-slate-950/20">
              <div className="mb-8 text-center text-sm uppercase tracking-[0.24em] text-sky-400">Secure workspace platform</div>
              {children}
              <p className="mt-6 text-center text-sm text-slate-400">
                {actionText}{' '}
                <Link to={actionLink} className="font-semibold text-sky-300 hover:text-sky-200">
                  {actionLabel}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPageShell;
