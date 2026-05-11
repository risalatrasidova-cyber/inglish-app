import axios, { AxiosError } from 'axios';
import type {
  AuthResponse,
  LessonListItem,
  LessonDetail,
  User,
  AdminAuthResponse,
  AdminLessonListItem,
  AdminLessonDetail,
  AdminWordListItem,
  Pagination,
  NextWordPayload,
  CheckAnswerLevel1Response,
} from '../types/api';

/**
 * В Vite основной env-ключ: VITE_API_URL.
 * NEXT_PUBLIC_API_URL добавлен как дополнительный fallback для Vercel-конфигов.
 */
const env = import.meta.env as Record<string, string | undefined>;
const API_URL = env.VITE_API_URL || env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const API_BASE = API_URL.trim().replace(/\/$/, '');

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('inglish_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err: AxiosError<{ message?: string; error?: string }>) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('inglish_token');
      localStorage.removeItem('inglish_user');
      window.dispatchEvent(new Event('inglish_unauthorized'));
    }
    return Promise.reject(err);
  }
);

// Admin API (отдельный токен)
const adminApi = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('inglish_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminApi.interceptors.response.use(
  (r) => r,
  (err: AxiosError) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('inglish_admin_token');
      localStorage.removeItem('inglish_admin');
      window.dispatchEvent(new Event('inglish_admin_unauthorized'));
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  login(login: string): Promise<AuthResponse> {
    return api.post<AuthResponse>('/auth/user/login', { login }).then((r) => r.data);
  },
  register(login: string): Promise<AuthResponse> {
    return api.post<AuthResponse>('/auth/user/register', { login }).then((r) => r.data);
  },
  me(): Promise<User> {
    return api.get<{ id: number; login: string; total_money: number; created_at: string; last_login?: string }>('/auth/user/me').then((r) => r.data);
  },
};

export const lessonsApi = {
  list(includeProgress = true): Promise<LessonListItem[]> {
    return api
      .get<LessonListItem[]>('/lessons', { params: { include_progress: includeProgress } })
      .then((r) => r.data);
  },
  get(id: number): Promise<LessonDetail> {
    return api.get<LessonDetail>(`/lessons/${id}`).then((r) => r.data);
  },
};

export const progressApi = {
  getNextWord(lessonId: number, levelNumber: number) {
    return api
      .get<NextWordPayload>(`/lessons/${lessonId}/levels/${levelNumber}/words/next`)
      .then((r) => r.data);
  },
  checkAnswerLevel1(
    lessonId: number,
    wordId: number,
    selectedAnswer: string,
    showInEnglish: boolean,
  ) {
    const safeWordId = Number(wordId);
    return api
      .post<CheckAnswerLevel1Response>(`/lessons/${lessonId}/levels/1/check-answer`, {
        word_id: safeWordId,
        show_in_english: showInEnglish,
        selected_answer: selectedAnswer,
      })
      .then((r) => r.data);
  },
  checkPronunciationLevel2(lessonId: number, wordId: number, spokenText: string) {
    return api
      .post<CheckAnswerLevel1Response>(`/lessons/${lessonId}/levels/2/check-pronunciation`, {
        word_id: Number(wordId),
        spoken_text: spokenText.trim(),
      })
      .then((r) => r.data);
  },
  checkSpellingLevel3(lessonId: number, wordId: number, typedText: string) {
    return api
      .post<CheckAnswerLevel1Response>(`/lessons/${lessonId}/levels/3/check-spelling`, {
        word_id: Number(wordId),
        typed_text: typedText.trim(),
      })
      .then((r) => r.data);
  },
};

// Admin API
const ADMIN_TOKEN = 'inglish_admin_token';
const ADMIN_USER = 'inglish_admin';

export const adminAuthApi = {
  login(login: string, password: string): Promise<AdminAuthResponse> {
    return adminApi.post<AdminAuthResponse>('/auth/admin/login', { login, password }).then((r) => r.data);
  },
  me() {
    return adminApi.get('/auth/admin/me').then((r) => r.data);
  },
  getStoredToken(): string | null {
    return localStorage.getItem(ADMIN_TOKEN);
  },
  setToken(token: string) {
    localStorage.setItem(ADMIN_TOKEN, token);
  },
  clearToken() {
    localStorage.removeItem(ADMIN_TOKEN);
    localStorage.removeItem(ADMIN_USER);
  },
};

export const adminLessonsApi = {
  list(params?: { page?: number; limit?: number; search?: string; sort?: string }) {
    return adminApi
      .get<{ lessons: AdminLessonListItem[]; pagination: Pagination }>('/admin/lessons', { params })
      .then((r) => r.data);
  },
  get(id: number): Promise<AdminLessonDetail> {
    return adminApi.get<AdminLessonDetail>(`/admin/lessons/${id}`).then((r) => r.data);
  },
  create(data: { name: string; description?: string; order?: number; is_active?: boolean; word_ids?: number[] }) {
    return adminApi.post<AdminLessonDetail>('/admin/lessons', data).then((r) => r.data);
  },
  update(id: number, data: { name?: string; description?: string; order?: number; is_active?: boolean; word_ids?: number[] }) {
    return adminApi.patch<AdminLessonDetail>(`/admin/lessons/${id}`, data).then((r) => r.data);
  },
  delete(id: number) {
    return adminApi.delete(`/admin/lessons/${id}`).then((r) => r.data);
  },
};

export const adminWordsApi = {
  list(params?: { page?: number; limit?: number; lesson_id?: number; search?: string; sort?: string }) {
    return adminApi
      .get<{ words: AdminWordListItem[]; pagination: Pagination }>('/admin/words', { params })
      .then((r) => r.data);
  },
  get(id: number) {
    return adminApi.get<AdminWordListItem>(`/admin/words/${id}`).then((r) => r.data);
  },
  create(formData: FormData) {
    return adminApi.post('/admin/words', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },
  update(id: number, formData: FormData) {
    return adminApi.patch(`/admin/words/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },
  delete(id: number) {
    return adminApi.delete(`/admin/words/${id}`).then((r) => r.data);
  },
};

export default api;
