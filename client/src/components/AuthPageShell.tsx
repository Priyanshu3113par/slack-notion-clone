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
    <div className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-950 text-sm font-black tracking-[0.18em] text-white">CH</span>
            <span className="text-sm font-black text-slate-950">CollabHub</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/login" className="rounded-md border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">Log in</Link>
            <Link to="/register" className="rounded-md bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800">Get started</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[0.9fr_0.7fr] lg:items-center lg:px-8">
        <section>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-sky-700">Secure workspace access</p>
          <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight text-slate-950 sm:text-5xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">{description}</p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              ['Auth', 'JWT access and refresh tokens'],
              ['Data', 'MongoDB models with protected relations'],
              ['Realtime', 'Socket.IO channels and document sync'],
              ['Access', 'Workspace membership validation']
            ].map(([label, text]) => (
              <div key={label} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
                <p className="mt-2 text-sm font-bold text-slate-800">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xl">
          {children}
          <p className="mt-6 text-center text-sm text-slate-600">
            {actionText}{' '}
            <Link to={actionLink} className="font-black text-sky-700 hover:text-sky-800">
              {actionLabel}
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
};

export default AuthPageShell;
