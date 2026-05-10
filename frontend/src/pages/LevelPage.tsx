import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { progressApi } from '../services/api';
import type { NextWordPayload, CheckAnswerLevel1Response } from '../types/api';
import { useAuth } from '../contexts/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function LevelPage() {
  const { refreshUser } = useAuth();
  const { lessonId, levelNumber } = useParams<{ lessonId: string; levelNumber: string }>();
  const parsedLessonId = lessonId ? parseInt(lessonId, 10) : NaN;
  const parsedLevelNumber = levelNumber ? parseInt(levelNumber, 10) : NaN;
  const isLevel1 = parsedLevelNumber === 1;
  const isLevel2 = parsedLevelNumber === 2;
  const isLevel3 = parsedLevelNumber === 3;

  const levelNames: Record<string, string> = {
    '1': 'Уровень 1: Тест',
    '2': 'Уровень 2: Аудио',
    '3': 'Уровень 3: Написание',
  };
  const name = levelNames[levelNumber || ''] || `Уровень ${levelNumber}`;

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [spokenText, setSpokenText] = useState('');
  const [typedSpelling, setTypedSpelling] = useState('');
  const [speechListening, setSpeechListening] = useState(false);
  const [result, setResult] = useState<CheckAnswerLevel1Response | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const canLoadLevel =
    Number.isInteger(parsedLessonId) &&
    Number.isInteger(parsedLevelNumber) &&
    (isLevel1 || isLevel2 || isLevel3);

  const {
    data: nextWord,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery<NextWordPayload>({
    queryKey: ['level-next-word', parsedLessonId, parsedLevelNumber],
    queryFn: () => progressApi.getNextWord(parsedLessonId, parsedLevelNumber),
    enabled: canLoadLevel,
    retry: 0,
  });

  const audioUrl = useMemo(() => {
    if (!nextWord?.word?.id) return '';
    const base = API_BASE.replace(/\/$/, '');
    return `${base}/audio/${nextWord.word.id}`;
  }, [nextWord?.word?.id]);

  useEffect(() => {
    setSelectedAnswer(null);
    setSpokenText('');
    setTypedSpelling('');
    setResult(null);
    setSubmitError(null);
  }, [nextWord?.word.id, nextWord?.show_in_english]);

  const checkAnswerMutation = useMutation({
    mutationFn: (payload: { wordId: number; answer: string; showInEnglish: boolean }) =>
      progressApi.checkAnswerLevel1(
        parsedLessonId,
        payload.wordId,
        payload.answer,
        payload.showInEnglish,
      ),
    onSuccess: async (data) => {
      setResult(data);
      setSubmitError(null);
      if (data.is_correct) {
        await refreshUser();
      }
    },
    onError: onMutationError,
  });

  const checkPronunciationMutation = useMutation({
    mutationFn: (payload: { wordId: number; spokenText: string }) =>
      progressApi.checkPronunciationLevel2(parsedLessonId, payload.wordId, payload.spokenText),
    onSuccess: async (data) => {
      setResult(data);
      setSubmitError(null);
      if (data.is_correct) {
        await refreshUser();
      }
    },
    onError: onMutationError,
  });

  const checkSpellingMutation = useMutation({
    mutationFn: (payload: { wordId: number; typedText: string }) =>
      progressApi.checkSpellingLevel3(parsedLessonId, payload.wordId, payload.typedText),
    onSuccess: async (data) => {
      setResult(data);
      setSubmitError(null);
      if (data.is_correct) {
        await refreshUser();
      }
    },
    onError: onMutationError,
  });

  function onMutationError(err: unknown) {
    const ax = err as AxiosError<{ message?: string | string[] }>;
    const msg = ax.response?.data?.message;
    const text = Array.isArray(msg) ? msg.join(', ') : msg;
    setSubmitError(text || 'Не удалось проверить ответ. Попробуй еще раз.');
  }

  const questionText = useMemo(() => {
    if (!nextWord || nextWord.show_in_english === undefined) return '';
    return nextWord.show_in_english
      ? nextWord.word.english_word
      : nextWord.word.russian_translation;
  }, [nextWord]);

  const answerLabel = nextWord?.show_in_english
    ? 'Выбери перевод на русский'
    : 'Выбери перевод на английский';

  const canGoToNextWord = result?.is_correct === true;

  const handleCheckAnswer = () => {
    if (!nextWord || !selectedAnswer) {
      return;
    }
    const wordId = Number(nextWord.word.id);
    if (!Number.isFinite(wordId)) {
      setSubmitError('Некорректный ID слова. Нажми "Следующее слово" и попробуй снова.');
      return;
    }
    setSubmitError(null);
    checkAnswerMutation.mutate({
      wordId,
      answer: selectedAnswer,
      showInEnglish: nextWord.show_in_english!,
    });
  };

  const handleCheckPronunciation = () => {
    if (!nextWord || !spokenText.trim()) {
      return;
    }
    const wordId = Number(nextWord.word.id);
    if (!Number.isFinite(wordId)) {
      setSubmitError('Некорректный ID слова.');
      return;
    }
    setSubmitError(null);
    checkPronunciationMutation.mutate({ wordId, spokenText });
  };

  const handleCheckSpelling = () => {
    if (!nextWord || !typedSpelling.trim()) {
      return;
    }
    const wordId = Number(nextWord.word.id);
    if (!Number.isFinite(wordId)) {
      setSubmitError('Некорректный ID слова.');
      return;
    }
    setSubmitError(null);
    checkSpellingMutation.mutate({ wordId, typedText: typedSpelling });
  };

  const playLevelAudio = () => {
    if (!audioRef.current) return;
    void audioRef.current.play().catch(() => {
      setSubmitError('Не удалось воспроизвести аудио. Проверь громкость и разрешения браузера.');
    });
  };

  const startSpeechRecognition = () => {
    const w = window as unknown as {
      SpeechRecognition?: new () => RecInstance;
      webkitSpeechRecognition?: new () => RecInstance;
    };
    type RecInstance = {
      lang: string;
      interimResults: boolean;
      maxAlternatives: number;
      onresult: ((ev: { results: Array<Array<{ transcript: string }>> }) => void) | null;
      onerror: (() => void) | null;
      onend: (() => void) | null;
      start: () => void;
    };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      setSubmitError('Распознавание речи не поддерживается в этом браузере. Введи слово вручную.');
      return;
    }
    const rec = new SR();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (ev) => {
      const text = ev.results[0]?.[0]?.transcript?.trim() ?? '';
      if (text) setSpokenText(text);
      setSpeechListening(false);
    };
    rec.onerror = () => setSpeechListening(false);
    rec.onend = () => setSpeechListening(false);
    setSpeechListening(true);
    rec.start();
  };

  const answerOptions = nextWord?.answer_options;

  return (
    <div>
      <Link to={`/lessons/${lessonId}`} className="text-amber-600 hover:underline">
        ← Назад к уроку
      </Link>
      <h2 className="text-xl font-semibold text-slate-800 mt-4">{name}</h2>

      {!isLevel1 && !isLevel2 && !isLevel3 && (
        <p className="mt-4 text-slate-500">Неизвестный уровень.</p>
      )}

      {isLevel1 && (
        <div className="mt-6 space-y-4">
          {isLoading && <p className="text-slate-500">Загружаю слово...</p>}

          {error && (
            <p className="text-red-600">
              Не удалось загрузить слово для уровня. Проверь, что в уроке есть слова.
            </p>
          )}

          {!isLoading && !error && nextWord && answerOptions && (
            <>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm text-slate-500">{answerLabel}</p>
                <p className="text-2xl font-semibold text-slate-800 mt-1">{questionText}</p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {answerOptions.map((option, idx) => (
                  <button
                    key={`${idx}-${option}`}
                    type="button"
                    onClick={() => setSelectedAnswer(option)}
                    className={`rounded-xl border px-4 py-3 text-left transition ${
                      selectedAnswer === option
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                    disabled={checkAnswerMutation.isPending}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCheckAnswer}
                  disabled={!selectedAnswer || checkAnswerMutation.isPending}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  Проверить
                </button>
                <button
                  type="button"
                  onClick={() => refetch()}
                  disabled={isFetching || !canGoToNextWord}
                  title={!canGoToNextWord ? 'Сначала ответь верно на это слово' : undefined}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Следующее слово
                </button>
              </div>

              <ResultBlock
                result={result}
                submitError={submitError}
                wrongHint="choice"
                pending={checkAnswerMutation.isPending}
              />
            </>
          )}
        </div>
      )}

      {isLevel2 && (
        <div className="mt-6 space-y-4">
          {isLoading && <p className="text-slate-500">Загружаю слово...</p>}

          {error && (
            <p className="text-red-600">
              Не удалось загрузить слово. Проверь, что в уроке есть слова и к ним прикреплено аудио.
            </p>
          )}

          {!isLoading && !error && nextWord && (
            <>
              {audioUrl ? (
                <audio ref={audioRef} src={audioUrl} preload="auto" className="hidden" />
              ) : null}

              <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
                <p className="text-sm text-slate-500 mb-1">Скажи по-английски</p>
                <p className="text-2xl font-semibold text-slate-800">{nextWord.word.russian_translation}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={playLevelAudio}
                  disabled={!audioUrl || checkPronunciationMutation.isPending}
                  className="py-4 px-3 rounded-xl border-2 border-indigo-200 bg-indigo-50 text-indigo-800 font-medium hover:bg-indigo-100 disabled:opacity-50"
                >
                  Прослушать
                </button>
                <button
                  type="button"
                  onClick={startSpeechRecognition}
                  disabled={speechListening || checkPronunciationMutation.isPending}
                  className="py-4 px-3 rounded-xl border-2 border-slate-200 bg-white text-slate-800 font-medium hover:bg-slate-50 disabled:opacity-50 flex flex-col items-center justify-center gap-1"
                >
                  <span className="text-xl" aria-hidden>
                    🎤
                  </span>
                  <span className="text-sm leading-tight">{speechListening ? 'Слушаю…' : 'Ответь устно'}</span>
                </button>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Твой ответ по-английски
                </label>
                <p className="text-xs text-slate-400 mb-2">
                  Подставится после микрофона; при необходимости поправь вручную.
                </p>
                <input
                  type="text"
                  value={spokenText}
                  onChange={(e) => setSpokenText(e.target.value)}
                  placeholder="например: cat"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 text-lg"
                  autoComplete="off"
                  disabled={checkPronunciationMutation.isPending}
                />
              </div>

              <button
                type="button"
                onClick={handleCheckPronunciation}
                disabled={!spokenText.trim() || checkPronunciationMutation.isPending}
                className="w-full py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                Проверить
              </button>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => refetch()}
                  disabled={isFetching || !canGoToNextWord}
                  title={!canGoToNextWord ? 'Сначала ответь верно на это слово' : undefined}
                  className="px-6 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Следующее слово
                </button>
              </div>

              <ResultBlock
                result={result}
                submitError={submitError}
                wrongHint="pronunciation"
                pending={checkPronunciationMutation.isPending}
              />
            </>
          )}
        </div>
      )}

      {isLevel3 && (
        <div className="mt-6 space-y-4">
          {isLoading && <p className="text-slate-500">Загружаю слово...</p>}

          {error && (
            <p className="text-red-600">
              Не удалось загрузить слово. Проверь, что в уроке есть слова.
            </p>
          )}

          {!isLoading && !error && nextWord && (
            <>
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
                <p className="text-sm text-slate-500 mb-1">Напиши по-английски</p>
                <p className="text-2xl font-semibold text-slate-800">{nextWord.word.russian_translation}</p>
                <p className="text-xs text-slate-400 mt-3 max-w-md mx-auto">
                  Совпадение с эталоном в базе без учёта регистра и пробелов по краям. Лишние символы или опечатки —
                  неверно.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <label className="block text-sm font-medium text-slate-600 mb-2">Слово на английском</label>
                <input
                  type="text"
                  value={typedSpelling}
                  onChange={(e) => setTypedSpelling(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCheckSpelling();
                  }}
                  placeholder="Например: cat"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 text-lg"
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  disabled={checkSpellingMutation.isPending}
                />
              </div>

              <button
                type="button"
                onClick={handleCheckSpelling}
                disabled={!typedSpelling.trim() || checkSpellingMutation.isPending}
                className="w-full py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                Проверить
              </button>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => refetch()}
                  disabled={isFetching || !canGoToNextWord}
                  title={!canGoToNextWord ? 'Сначала ответь верно на это слово' : undefined}
                  className="px-6 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Следующее слово
                </button>
              </div>

              <ResultBlock
                result={result}
                submitError={submitError}
                wrongHint="spelling"
                pending={checkSpellingMutation.isPending}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ResultBlock({
  result,
  submitError,
  wrongHint,
  pending,
}: {
  result: CheckAnswerLevel1Response | null;
  submitError: string | null;
  wrongHint: 'choice' | 'pronunciation' | 'spelling';
  pending: boolean;
}) {
  if (pending && !result) {
    return null;
  }

  return (
    <>
      {result && (
        <div
          className={`rounded-xl p-4 border ${
            result.is_correct
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}
        >
          <p className="font-medium">{result.is_correct ? 'Верно!' : 'Неверно'}</p>
          {result.message && <p className="text-sm mt-1">{result.message}</p>}
          {!result.is_correct && wrongHint === 'choice' && (
            <p className="text-sm mt-2">
              Выбери другой вариант и снова нажми «Проверить». К следующему слову можно перейти только после
              верного ответа.
            </p>
          )}
          {!result.is_correct && wrongHint === 'pronunciation' && (
            <p className="text-sm mt-2">
              Попробуй другое написание или произнеси слово ещё раз. К следующему слову — только после верного
              ответа.
            </p>
          )}
          {!result.is_correct && wrongHint === 'spelling' && (
            <p className="text-sm mt-2">
              Исправь написание и снова нажми «Проверить». К следующему слову можно перейти только после верного
              ответа.
            </p>
          )}
          {typeof result.similarity === 'number' && (
            <p className="text-sm mt-1">Схожесть с эталоном: {Math.round(result.similarity)}%</p>
          )}
          {result.correct_answer && !result.is_correct && (
            <p className="text-sm mt-1">Ожидалось: {result.correct_answer}</p>
          )}
          {result.reward?.message && <p className="text-sm mt-1">Награда: {result.reward.message}</p>}
          <p className="text-sm mt-2">
            Прогресс: {result.progress.correct_count}/{result.progress.total_words} ({result.progress.percentage}%)
          </p>
        </div>
      )}

      {submitError && <p className="text-red-600 text-sm">{submitError}</p>}
    </>
  );
}
