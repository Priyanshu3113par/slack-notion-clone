import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AuthPageShell from '../components/AuthPageShell';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    try {
      const response = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
      navigate('/app');
    } catch (_err) {
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <AuthPageShell
      title="Powerful collaboration without the noise"
      description="Enter your workspace, join channels, and connect with your team in an interface built for speed and clarity."
      actionText="Need an account?"
      actionLink="/register"
      actionLabel="Sign up"
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-lg shadow-slate-950/10">
          <label className="block text-sm font-medium text-slate-200">
            Email
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-3 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
            />
          </label>
          <label className="block text-sm font-medium text-slate-200">
            Password
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-3 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
            />
          </label>
          {error && <div className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</div>}
          <button
            type="submit"
            className="mt-4 w-full rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:from-sky-400 hover:to-cyan-300"
          >
            Continue
          </button>
        </div>
      </form>
    </AuthPageShell>
  );
};

export default LoginPage;
