import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { lessonsApi } from '../services/api';
import type { LessonListItem } from '../types/api';

function LessonCard({ lesson }: { lesson: LessonListItem }) {
  const progress = lesson.progress;
  const stars = progress?.stars;
  const starIcon = (type: 'gold' | 'diamond' | null) => {
    if (!type) return null;
    return type === 'diamond' ? '💎' : '⭐';
  };

  return (
    <Link
      to={lesson.is_available ? `/lessons/${lesson.id}` : '#'}
      className={`block rounded-2xl border p-5 text-left transition ${
        lesson.is_available
          ? 'bg-white border-slate-200 hover:border-amber-300 hover:shadow-md'
          : 'bg-slate-100 border-slate-200 opacity-75 cursor-not-allowed'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-800 truncate">{lesson.name}</h3>
          {lesson.description && (
            <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">
              {lesson.description}
            </p>
          )}
          <p className="text-xs text-slate-400 mt-2">
            Слов: {lesson.word_count}
          </p>
        </div>
        <div className="flex gap-1 shrink-0" aria-label="Звёзды за уровни">
          <span title="Уровень 1">{starIcon(stars?.level_1 ?? null)}</span>
          <span title="Уровень 2">{starIcon(stars?.level_2 ?? null)}</span>
          <span title="Уровень 3">{starIcon(stars?.level_3 ?? null)}</span>
        </div>
      </div>
      {!lesson.is_available && (
        <p className="text-xs text-amber-700 mt-2">
          Пройди 2 уровня в предыдущем уроке
        </p>
      )}
    </Link>
  );
}

export function HomePage() {
  const { data: lessons, isLoading, error } = useQuery({
    queryKey: ['lessons'],
    queryFn: () => lessonsApi.list(true),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <p className="text-slate-500">Загрузка уроков...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700">
        Не удалось загрузить уроки. Проверь, что бэкенд запущен.
      </div>
    );
  }

  if (!lessons?.length) {
    return (
      <div className="rounded-xl bg-amber-50 border border-amber-200 p-6 text-center text-slate-700">
        <p className="font-medium">Пока нет уроков</p>
        <p className="text-sm mt-1">Добавь уроки в админ-панели.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-800 mb-4">Уроки</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {lessons.map((lesson) => (
          <LessonCard key={lesson.id} lesson={lesson} />
        ))}
      </div>
    </div>
  );
}
