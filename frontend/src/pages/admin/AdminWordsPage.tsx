import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminWordsApi, adminLessonsApi } from '../../services/api';

export function AdminWordsPage() {
  const [page, setPage] = useState(1);
  const [lessonId, setLessonId] = useState<number | ''>('');
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-words', page, lessonId, search],
    queryFn: () =>
      adminWordsApi.list({
        page,
        limit: 15,
        lesson_id: lessonId === '' ? undefined : lessonId,
        search: search || undefined,
        sort: 'created_at',
      }),
  });

  const { data: lessonsData } = useQuery({
    queryKey: ['admin-lessons-list'],
    queryFn: () => adminLessonsApi.list({ limit: 100 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminWordsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-words'] }),
  });

  const handleDelete = (id: number, word: string) => {
    if (window.confirm(`Удалить слово «${word}»?`)) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <p className="text-slate-500">Загрузка...</p>;
  if (error) return <p className="text-red-600">Ошибка загрузки слов.</p>;

  const { words = [], pagination } = data ?? {};
  const lessons = lessonsData?.lessons ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Слова</h1>
        <Link
          to="/admin/words/new"
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700"
        >
          Добавить слово
        </Link>
      </div>
      <div className="flex gap-4 mb-4 flex-wrap">
        <input
          type="search"
          placeholder="Поиск..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-lg border border-slate-200 w-48"
        />
        <select
          value={lessonId}
          onChange={(e) => setLessonId(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
          className="px-4 py-2 rounded-lg border border-slate-200"
        >
          <option value="">Все уроки</option>
          {lessons.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-slate-600 font-medium">Английский</th>
              <th className="text-left px-4 py-3 text-slate-600 font-medium">Русский</th>
              <th className="text-left px-4 py-3 text-slate-600 font-medium">Урок</th>
              <th className="w-32" />
            </tr>
          </thead>
          <tbody>
            {words.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  Нет слов. Добавьте первое слово (нужен урок и аудио MP3).
                </td>
              </tr>
            ) : (
              words.map((word) => (
                <tr key={word.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-800">{word.english_word}</td>
                  <td className="px-4 py-3 text-slate-600">{word.russian_translation}</td>
                  <td className="px-4 py-3 text-slate-600">{word.lesson_name ?? word.lesson_id}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/words/${word.id}/edit`)}
                      className="text-indigo-600 hover:underline mr-2"
                    >
                      Изменить
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(word.id, word.english_word)}
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
