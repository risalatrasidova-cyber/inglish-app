import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { lessonsApi } from '../services/api';

export function LessonDetailPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const id = lessonId ? parseInt(lessonId, 10) : NaN;

  const { data: lesson, isLoading, error } = useQuery({
    queryKey: ['lesson', id],
    queryFn: () => lessonsApi.get(id),
    enabled: Number.isInteger(id),
  });

  if (!Number.isInteger(id)) {
    return (
      <div className="text-slate-500">
        <Link to="/" className="text-amber-600 hover:underline">← Назад</Link>
        <p className="mt-4">Неверный ID урока.</p>
      </div>
    );
  }

  if (isLoading) {
    return <p className="text-slate-500">Загрузка...</p>;
  }

  if (error || !lesson) {
    return (
      <div>
        <Link to="/" className="text-amber-600 hover:underline">← Назад к урокам</Link>
        <p className="mt-4 text-red-600">Урок не найден.</p>
      </div>
    );
  }

  return (
    <div>
      <Link to="/" className="inline-flex items-center gap-1 text-amber-600 hover:underline mb-4">
        ← Назад к урокам
      </Link>
      <h2 className="text-2xl font-semibold text-slate-800 mb-2">{lesson.name}</h2>
      {lesson.description && (
        <p className="text-slate-600 mb-4">{lesson.description}</p>
      )}
      <p className="text-sm text-slate-500 mb-6">Слов в уроке: {lesson.words.length}</p>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          to={`/lessons/${lesson.id}/level/1`}
          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 hover:border-amber-300 hover:shadow transition"
        >
          <span className="font-medium text-slate-800">Уровень 1</span>
          <span className="text-slate-400">Тест →</span>
        </Link>
        <Link
          to={`/lessons/${lesson.id}/level/2`}
          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 hover:border-amber-300 hover:shadow transition"
        >
          <span className="font-medium text-slate-800">Уровень 2</span>
          <span className="text-slate-400">Аудио →</span>
        </Link>
        <Link
          to={`/lessons/${lesson.id}/level/3`}
          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 hover:border-amber-300 hover:shadow transition col-span-full sm:col-span-2"
        >
          <span className="font-medium text-slate-800">Уровень 3</span>
          <span className="text-slate-400">Написание →</span>
        </Link>
      </div>
    </div>
  );
}
