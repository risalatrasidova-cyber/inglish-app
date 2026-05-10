import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminWordsApi, adminLessonsApi } from '../../services/api';

export function AdminWordFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id) && id !== 'new';
  const wordId = isEdit ? parseInt(id as string, 10) : null;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [englishWord, setEnglishWord] = useState('');
  const [russianTranslation, setRussianTranslation] = useState('');
  const [lessonId, setLessonId] = useState<number | ''>('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: word, isLoading: wordLoading } = useQuery({
    queryKey: ['admin-word', wordId],
    queryFn: () => adminWordsApi.get(wordId!),
    enabled: isEdit && !!wordId,
  });

  const { data: lessonsData } = useQuery({
    queryKey: ['admin-lessons-list'],
    queryFn: () => adminLessonsApi.list({ limit: 100 }),
  });

  useEffect(() => {
    if (word) {
      setEnglishWord(word.english_word);
      setRussianTranslation(word.russian_translation);
      setLessonId(word.lesson_id);
    }
  }, [word]);

  const createMutation = useMutation({
    mutationFn: (formData: FormData) => adminWordsApi.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-words'] });
      navigate('/admin/words');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setError(err.response?.data?.message || 'Ошибка сохранения');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (formData: FormData) => adminWordsApi.update(wordId!, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-words'] });
      navigate('/admin/words');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setError(err.response?.data?.message || 'Ошибка сохранения');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!englishWord.trim() || !russianTranslation.trim()) {
      setError('Заполните английское слово и перевод');
      return;
    }
    if (!isEdit && !audioFile) {
      setError('Для нового слова нужен аудиофайл (MP3)');
      return;
    }
    if (!isEdit && (lessonId === '' || lessonId === null)) {
      setError('Выберите урок');
      return;
    }
    setSaving(true);
    const formData = new FormData();
    formData.append('english_word', englishWord.trim());
    formData.append('russian_translation', russianTranslation.trim());
    if (lessonId !== '' && lessonId !== null) {
      formData.append('lesson_id', String(lessonId));
    }
    if (audioFile) {
      formData.append('audio_file', audioFile);
    }
    if (isEdit) {
      updateMutation.mutate(formData, { onSettled: () => setSaving(false) });
    } else {
      createMutation.mutate(formData, { onSettled: () => setSaving(false) });
    }
  };

  const lessons = lessonsData?.lessons ?? [];

  if (isEdit && wordLoading) return <p className="text-slate-500">Загрузка...</p>;

  return (
    <div>
      <Link to="/admin/words" className="text-indigo-600 hover:underline mb-4 inline-block">
        ← К списку слов
      </Link>
      <h1 className="text-2xl font-semibold text-slate-800 mb-6">
        {isEdit ? 'Редактировать слово' : 'Новое слово'}
      </h1>
      <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Английское слово *</label>
          <input
            type="text"
            value={englishWord}
            onChange={(e) => setEnglishWord(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-lg border border-slate-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Русский перевод *</label>
          <input
            type="text"
            value={russianTranslation}
            onChange={(e) => setRussianTranslation(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-lg border border-slate-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Урок *</label>
          <select
            value={lessonId === '' ? '' : lessonId}
            onChange={(e) => setLessonId(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
            required={!isEdit}
            className="w-full px-4 py-2 rounded-lg border border-slate-200"
          >
            <option value="">Выберите урок</option>
            {lessons.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Аудиофайл (MP3) {isEdit ? '(оставьте пустым, чтобы не менять)' : '*'}
          </label>
          <input
            type="file"
            accept=".mp3,audio/mpeg"
            onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
            className="w-full px-4 py-2 rounded-lg border border-slate-200"
          />
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
            to="/admin/words"
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            Отмена
          </Link>
        </div>
      </form>
    </div>
  );
}
