import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import AuthPageShell from '../components/AuthPageShell';
import { useToast } from '../components/ToastProvider';
import api from '../services/api';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const hasLength = password.length >= 8 && password.length <= 15;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+{}\[\]:;"'<>,.?/~`|-]/.test(password);
  const isPasswordValid = hasLength && hasUpper && hasNumber && hasSpecial;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!isPasswordValid) {
      setError('Please fulfill all password requirements before registering.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
      localStorage.setItem('userId', response.data.data.user.id);
      localStorage.setItem('userName', response.data.data.user.name);
      showToast('Account created', 'Your workspace is ready. Start collaborating now.', 'success');
      navigate('/app');
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      const message = axiosError.response?.data?.message ?? 'Registration failed. Please try again.';
      setError(message);
      showToast('Registration failed', message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageShell
      title="Build your team workspace in minutes"
      description="Create a secure collaboration environment for your organization with streamlined onboarding and instant connectivity."
      actionText="Already have an account?"
      actionLink="/login"
      actionLabel="Sign in"
    >
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">New workspace</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">Create your account</h2>
        </div>

        <div className="grid gap-4">
          <label className="block text-sm font-bold text-slate-700">
            Full name
            <input
              id="name"
              type="text"
              required
              placeholder="Jane Doe"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
            />
          </label>

          <label className="block text-sm font-bold text-slate-700">
            Work email
            <input
              id="email"
              type="email"
              required
              placeholder="jane@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
            />
          </label>

          <label className="block text-sm font-bold text-slate-700">
            Password
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Create a strong password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
              autoComplete="new-password"
            />
          </label>
        </div>

        <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4">
          <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-slate-500">Password requirements</p>
          <ul className="space-y-1 text-xs">
            <li className={`flex items-center gap-2 ${hasLength ? 'text-emerald-600' : 'text-slate-500'}`}><span>{hasLength ? 'OK' : '--'}</span> 8-15 characters</li>
            <li className={`flex items-center gap-2 ${hasUpper ? 'text-emerald-600' : 'text-slate-500'}`}><span>{hasUpper ? 'OK' : '--'}</span> 1 capital letter</li>
            <li className={`flex items-center gap-2 ${hasNumber ? 'text-emerald-600' : 'text-slate-500'}`}><span>{hasNumber ? 'OK' : '--'}</span> 1 number</li>
            <li className={`flex items-center gap-2 ${hasSpecial ? 'text-emerald-600' : 'text-slate-500'}`}><span>{hasSpecial ? 'OK' : '--'}</span> 1 special character</li>
          </ul>
        </div>

        <button
          type="button"
          onClick={() => setShowPassword((current) => !current)}
          className="mt-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-100"
        >
          {showPassword ? 'Hide password' : 'Show password'}
        </button>

        {error && <div className="mt-4 rounded-md border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">{error}</div>}

        <button
          type="submit"
          disabled={loading || (!isPasswordValid && password.length > 0)}
          className="mt-5 w-full cursor-pointer rounded-md bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </AuthPageShell>
  );
};

export default RegisterPage;
