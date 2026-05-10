import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminLessonsApi } from '../../services/api';

export function AdminLessonsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-lessons', page, search],
    queryFn: () => adminLessonsApi.list({ page, limit: 10, search: search || undefined, sort: 'order' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminLessonsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-lessons'] }),
  });

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Удалить урок «${name}»?`)) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <p className="text-slate-500">Загрузка...</p>;
  if (error) return <p className="text-red-600">Ошибка загрузки уроков.</p>;

  const { lessons = [], pagination } = data ?? {};

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Уроки</h1>
        <Link
          to="/admin/lessons/new"
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700"
        >
          Добавить урок
        </Link>
      </div>
      <div className="mb-4">
        <input
          type="search"
          placeholder="Поиск по названию..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-lg border border-slate-200 w-64"
        />
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-slate-600 font-medium">Название</th>
              <th className="text-left px-4 py-3 text-slate-600 font-medium">Слов</th>
              <th className="text-left px-4 py-3 text-slate-600 font-medium">Порядок</th>
              <th className="text-left px-4 py-3 text-slate-600 font-medium">Активен</th>
              <th className="w-32" />
            </tr>
          </thead>
          <tbody>
            {lessons.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Нет уроков. Добавьте первый урок.
                </td>
              </tr>
            ) : (
              lessons.map((lesson) => (
                <tr key={lesson.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-800">{lesson.name}</td>
                  <td className="px-4 py-3 text-slate-600">{lesson.word_count}</td>
                  <td className="px-4 py-3 text-slate-600">{lesson.order}</td>
                  <td className="px-4 py-3">{lesson.is_active ? 'Да' : 'Нет'}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/lessons/${lesson.id}/edit`)}
                      className="text-indigo-600 hover:underline mr-2"
                    >
                      Изменить
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(lesson.id, lesson.name)}
                      className="text-red-600 hover:underline"
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {pagination && pagination.total_pages > 1 && (
          <div className="px-4 py-3 border-t border-slate-200 flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 rounded border border-slate-200 disabled:opacity-50"
            >
              Назад
            </button>
            <span className="py-1 text-slate-600">
              {page} / {pagination.total_pages}
            </span>
            <button
              type="button"
              disabled={page >= pagination.total_pages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 rounded border border-slate-200 disabled:opacity-50"
            >
              Вперёд
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
