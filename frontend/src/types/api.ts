export interface User {
  id: number;
  login: string;
  total_money: number;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LessonListItem {
  id: number;
  name: string;
  description: string | null;
  order: number;
  is_active: boolean;
  word_count: number;
  is_available: boolean;
  progress?: LessonProgress;
}

export interface LessonProgress {
  level_1_completed: boolean;
  level_2_completed: boolean;
  level_3_completed: boolean;
  stars: {
    level_1: 'gold' | 'diamond' | null;
    level_2: 'gold' | 'diamond' | null;
    level_3: 'gold' | 'diamond' | null;
  };
}

export interface LessonDetail {
  id: number;
  name: string;
  description: string | null;
  order: number;
  is_active: boolean;
  words: { id: number; english_word: string; russian_translation: string }[];
  created_at: string;
  updated_at: string;
}

export interface ApiError {
  message?: string;
  error?: string;
  statusCode?: number;
}

// Admin
export interface Admin {
  id: number;
  login: string;
  created_at: string;
}

export interface AdminAuthResponse {
  token: string;
  admin: Admin;
}

export interface AdminLessonListItem {
  id: number;
  name: string;
  description: string | null;
  order: number;
  is_active: boolean;
  word_count: number;
  created_at: string;
  updated_at: string;
}

export interface AdminLessonDetail {
  id: number;
  name: string;
  description: string | null;
  order: number;
  is_active: boolean;
  words: { id: number; english_word: string; russian_translation: string }[];
  created_at: string;
  updated_at: string;
}

export interface AdminWordListItem {
  id: number;
  english_word: string;
  russian_translation: string;
  lesson_id: number;
  lesson_name?: string;
  audio_file_path: string;
  audio_file_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface LevelWord {
  id: number;
  english_word: string;
  russian_translation: string;
  audio_file_path: string;
}

/** Уровень 1: есть варианты ответа. Уровни 2–3: только слово (аудио / написание). */
export interface NextWordPayload {
  word: LevelWord;
  show_in_english?: boolean;
  answer_options?: string[];
}

export type NextWordLevel1Response = NextWordPayload & {
  show_in_english: boolean;
  answer_options: string[];
}

export interface CheckAnswerLevel1Response {
  is_correct: boolean;
  is_new_word?: boolean;
  message?: string;
  correct_answer?: string;
  audio_file_path?: string;
  similarity?: number;
  reward?: {
    amount: number;
    message: string;
  };
  progress: {
    correct_count: number;
    total_words: number;
    percentage: number;
  };
}
