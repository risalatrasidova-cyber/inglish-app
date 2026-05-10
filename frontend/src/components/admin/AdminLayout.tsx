import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

export function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="w-56 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-800">Админ-кабинет</h2>
          <p className="text-xs text-slate-500 mt-0.5">{admin?.login}</p>
        </div>
        <nav className="p-2 flex-1">
          <Link
            to="/admin/lessons"
            className="block px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-100"
          >
            Уроки
          </Link>
          <Link
            to="/admin/words"
            className="block px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-100"
          >
            Слова
          </Link>
        </nav>
        <div className="p-2 border-t border-slate-200">
          <Link
            to="/"
            className="block px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-100 text-sm"
          >
            На главную приложения
          </Link>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/admin/login', { replace: true });
            }}
            className="block w-full text-left px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-100 text-sm"
          >
            Выйти
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
