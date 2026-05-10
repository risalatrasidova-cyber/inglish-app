import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminLessonsApi, adminWordsApi } from '../../services/api';

export function AdminLessonFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id) && id !== 'new';
  const lessonId = isEdit ? parseInt(id as string, 10) : null;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [wordIds, setWordIds] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: lesson, isLoading: lessonLoading } = useQuery({
    queryKey: ['admin-lesson', lessonId],
    queryFn: () => adminLessonsApi.get(lessonId!),
    enabled: isEdit && !!lessonId,
  });

  const { data: wordsData } = useQuery({
    queryKey: ['admin-words-all'],
    queryFn: () => adminWordsApi.list({ limit: 100 }),
  });

  useEffect(() => {
    if (lesson) {
      setName(lesson.name);
      setDescription(lesson.description || '');
      setOrder(lesson.order ?? 0);
      setIsActive(lesson.is_active ?? true);
      setWordIds(lesson.words?.map((w) => w.id) ?? []);
    }
  }, [lesson]);

  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof adminLessonsApi.create>[0]) => adminLessonsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lessons'] });
      navigate('/admin/lessons');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setError(err.response?.data?.message || 'Ошибка сохранения');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Parameters<typeof adminLessonsApi.update>[1]) =>
      adminLessonsApi.update(lessonId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lessons'] });
      navigate('/admin/lessons');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setError(err.response?.data?.message || 'Ошибка сохранения');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    const payload = { name, description: description || undefined, order, is_active: isActive, word_ids: wordIds };
    if (isEdit) {
      updateMutation.mutate(payload, { onSettled: () => setSaving(false) });
    } else {
      createMutation.mutate(payload, { onSettled: () => setSaving(false) });
    }
  };

  const allWords = wordsData?.words ?? [];
  const toggleWord = (wordId: number) => {
    setWordIds((prev) =>
      prev.includes(wordId) ? prev.filter((id) => id !== wordId) : [...prev, wordId]
    );
  };

  if (isEdit && lessonLoading) return <p className="text-slate-500">Загрузка...</p>;

  return (
    <div>
      <Link to="/admin/lessons" className="text-indigo-600 hover:underline mb-4 inline-block">
        ← К списку уроков
      </Link>
      <h1 className="text-2xl font-semibold text-slate-800 mb-6">
        {isEdit ? 'Редактировать урок' : 'Новый урок'}
      </h1>
      <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Название *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-lg border border-slate-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Описание</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-4 py-2 rounded-lg border border-slate-200"
          />
        </div>
        <div className="flex gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Порядок</label>
            <input
              type="number"
              min={0}
              value={order}
              onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)}
              className="w-24 px-4 py-2 rounded-lg border border-slate-200"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <label htmlFor="is_active" className="text-slate-700">
              Урок активен (виден пользователям)
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Слова в уроке</label>
          <p className="text-sm text-slate-500 mb-2">
            Отметьте слова, которые входят в этот урок. Сначала создайте слова в разделе «Слова».
          </p>
          <div className="border border-slate-200 rounded-lg p-3 max-h-48 overflow-y-auto">
            {allWords.length === 0 ? (
              <p className="text-slate-500 text-sm">Нет слов. Добавьте слова в разделе «Слова».</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {allWords.map((w) => (
                  <label key={w.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={wordIds.includes(w.id)}
                      onChange={() => toggleWord(w.id)}
                    />
                    <span className="text-sm">
                      {w.english_word} — {w.russian_translation}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
          <Link
            to="/admin/lessons"
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            Отмена
          </Link>
        </div>
      </form>
    </div>
  );
}
