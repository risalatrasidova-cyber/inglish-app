import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Layout() {
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [moneyModalOpen, setMoneyModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="text-xl font-semibold text-slate-800 hover:text-amber-600 transition">
            Inglish
          </Link>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMoneyModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-amber-50 text-slate-700"
              title="Заработанные деньги"
            >
              <span className="text-lg">💰</span>
              <span className="font-medium">{user?.total_money ?? 0} ₽</span>
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700"
                aria-expanded={userMenuOpen}
              >
                <span className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 font-medium">
                  {user?.login?.charAt(0).toUpperCase() || '?'}
                </span>
                <span className="hidden sm:inline font-medium">{user?.login}</span>
              </button>
              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    aria-hidden
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 py-1 w-48 bg-white rounded-xl shadow-lg border border-slate-200 z-20">
                    <Link
                      to="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-slate-700 hover:bg-slate-50"
                    >
                      Админ-кабинет
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                        navigate('/login', { replace: true });
                      }}
                      className="block w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50"
                    >
                      Сменить пользователя
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50"
                    >
                      Выйти
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">
        <Outlet />
      </main>

      {moneyModalOpen && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/40"
          onClick={() => setMoneyModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Твои деньги
            </h3>
            <p className="text-2xl font-bold text-amber-600 mb-4">
              {user?.total_money ?? 0} ₽
            </p>
            <div className="text-sm text-slate-600 space-y-2 mb-4">
              <p>
                Баланс в шапке обновляется после верных ответов (игровые «рубли», не реальные деньги).
              </p>
              <p className="text-slate-500">
                Начисления: <strong>5 ₽</strong> за слово на уровне 1, <strong>10 ₽</strong> на уровне 2,{' '}
                <strong>15 ₽</strong> на уровне 3 (один раз за первое верное прохождение слова на этом уровне).
                Повторные верные ответы по тому же
                слову на том же уровне не дают бонус снова. Дополнительно: <strong>100 ₽</strong> при
                ≥90% верных в уроке, <strong>150 ₽</strong> при 100%.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMoneyModalOpen(false)}
              className="w-full py-2 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
