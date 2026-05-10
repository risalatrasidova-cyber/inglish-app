import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

export function AdminLoginPage() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login: doLogin } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!login.trim() || !password) {
      setError('Введите логин и пароль');
      return;
    }
    setLoading(true);
    try {
      await doLogin(login.trim(), password);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Ошибка входа';
      setError(msg || 'Неверный логин или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow border border-slate-200 p-8">
        <h1 className="text-xl font-semibold text-slate-800 text-center mb-1">
          Админ-кабинет
        </h1>
        <p className="text-slate-500 text-sm text-center mb-6">
          Вход для администратора
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder="Логин"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 outline-none transition"
            autoComplete="username"
            disabled={loading}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 outline-none transition"
            autoComplete="current-password"
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
            className="w-full py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 disabled:opacity-50 transition"
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
        <p className="text-center mt-4">
          <Link to="/" className="text-sm text-slate-500 hover:text-slate-700">
            ← На главную приложения
          </Link>
        </p>
      </div>
    </div>
  );
}
