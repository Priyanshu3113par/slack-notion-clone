import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import AuthPageShell from '../components/AuthPageShell';
import { useToast } from '../components/ToastProvider';
import api from '../services/api';

const LoginPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
      localStorage.setItem('userId', response.data.data.user.id);
      localStorage.setItem('userName', response.data.data.user.name);
      showToast('Welcome back', 'You are signed in and ready to collaborate.', 'success');
      navigate('/app');
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      const message = axiosError.response?.data?.message ?? 'Invalid email or password. Please try again.';
      setError(message);
      showToast('Sign in failed', message, 'error');
    } finally {
      setLoading(false);
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
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <label className="block text-sm font-medium text-slate-700 mb-4">
            Email address
            <input
              id="email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700 mb-4">
            Password
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              autoComplete="current-password"
            />
          </label>
          <div className="mt-4 flex items-center justify-between gap-3 text-xs text-slate-500">
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-medium transition hover:border-slate-300 hover:bg-slate-100 text-slate-600"
            >
              {showPassword ? 'Hide password' : 'Show password'}
            </button>
            <span>Password is hidden by default</span>
          </div>
          {error && <div className="mt-4 rounded-xl bg-rose-50 border border-rose-100 px-4 py-3 text-sm text-rose-600">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/10 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </div>
      </form>
    </AuthPageShell>
  );
};

export default LoginPage;
