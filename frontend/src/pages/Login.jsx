import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { errorMessage } from '../api/client';
import { Alert, Spinner } from '../components/ui';
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from '../utils/constants';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Already logged in → skip login page
  if (user) return <Navigate to="/" replace />;

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await login(email, password);
      navigate(location.state?.from || '/', { replace: true }); // back to the page they wanted
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-army-900 px-4 py-10">
      <div className="animate-pop-in w-full max-w-sm">
        <div className="mb-8 text-center text-white">
          <span className="mb-3 inline-flex rounded-xl bg-army-600 p-3"><Shield size={28} /></span>
          <h1 className="text-2xl font-semibold">KristalBall</h1>
          <p className="text-sm text-army-300">Military Asset Management System</p>
        </div>

        <form onSubmit={onSubmit} className="rounded-2xl bg-white p-6 shadow-xl">
          <Alert>{error}</Alert>
          <label className="mb-4 block">
            <span className="label">Email</span>
            <input type="email" required autoComplete="username" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="mb-6 block">
            <span className="label">Password</span>
            <input type="password" required autoComplete="current-password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting && <Spinner className="size-4 text-white" />}
            Sign in
          </button>

          {/* Quick-fill seeded accounts (for demo / evaluation) */}
          <div className="mt-6 border-t border-stone-200 pt-4">
            <p className="mb-2 text-xs text-stone-500">Demo accounts (password: {DEMO_PASSWORD})</p>
            <div className="flex flex-wrap gap-2">
              {DEMO_ACCOUNTS.map((a) => (
                <button
                  key={a.email}
                  type="button"
                  onClick={() => { setEmail(a.email); setPassword(DEMO_PASSWORD); }}
                  className="rounded-full border border-stone-300 px-3 py-1 text-xs text-stone-600 transition hover:border-army-400 hover:bg-army-50"
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
