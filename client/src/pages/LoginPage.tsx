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
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Welcome back</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">Sign in to CollabHub</h2>
        </div>

        <label className="mb-4 block text-sm font-bold text-slate-700">
          Email address
          <input
            id="email"
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
          />
        </label>

        <label className="mb-4 block text-sm font-bold text-slate-700">
          Password
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            required
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
            autoComplete="current-password"
          />
        </label>

        <div className="mt-4 flex items-center justify-between gap-3 text-xs text-slate-500">
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-100"
          >
            {showPassword ? 'Hide password' : 'Show password'}
          </button>
          <span>Password is hidden by default</span>
        </div>

        {error && <div className="mt-4 rounded-md border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full cursor-pointer rounded-md bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </AuthPageShell>
  );
};

export default LoginPage;
