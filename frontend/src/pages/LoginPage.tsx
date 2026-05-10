import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const [login, setLogin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login: doLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmed = login.trim();
    if (!trimmed) {
      setError('Введите логин');
      return;
    }
    setLoading(true);
    try {
      await doLogin(trimmed);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string; error?: string } } }).response?.data?.error ||
            (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Ошибка входа';
      setError(msg || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-orange-50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-lg border border-amber-100 p-8">
        <h1 className="text-2xl font-semibold text-slate-800 text-center mb-2">
          Inglish
        </h1>
        <p className="text-slate-500 text-sm text-center mb-6">
          Войдите по логину (без пароля)
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder="Логин"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none transition"
            autoComplete="username"
            disabled={loading}
          />
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 disabled:opacity-50 transition"
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  );
}
