# API ENDPOINTS

## 📊 Общая информация

**Base URL:** `https://api.inglish-app.com/api` (или локально: `http://localhost:3000/api`)

**Формат данных:** JSON

**Аутентификация:**
- **Пользователи:** JWT токен (получается при входе по логину)
- **Администраторы:** JWT токен (получается при входе по логину + паролю)

**Коды ответов:**
- `200` - Успешно
- `201` - Создано
- `400` - Ошибка валидации
- `401` - Не авторизован
- `403` - Доступ запрещен
- `404` - Не найдено
- `500` - Ошибка сервера

---

## 🔐 ГРУППА 1: Авторизация пользователей

### 1.1. Вход пользователя (только логин)

**POST** `/auth/user/login`

**Описание:** Вход пользователя по логину (без пароля). Если пользователя нет - создается новый.

**Request Body:**
```json
{
  "login": "user123"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "login": "user123",
      "total_money": 50,
      "created_at": "2024-01-15T10:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Response 400:**
```json
{
  "success": false,
  "error": "Login is required"
}
```

---

### 1.2. Получить текущего пользователя

**GET** `/auth/user/me`

**Headers:** `Authorization: Bearer {token}`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "login": "user123",
    "total_money": 50,
    "created_at": "2024-01-15T10:00:00Z",
    "last_login": "2024-01-20T15:30:00Z"
  }
}
```

---

### 1.3. Создать нового пользователя

**POST** `/auth/user/register`

**Описание:** Создание нового пользователя (альтернатива входу)

**Request Body:**
```json
{
  "login": "newuser"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 2,
      "login": "newuser",
      "total_money": 0,
      "created_at": "2024-01-20T16:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Response 400:**
```json
{
  "success": false,
  "error": "User with this login already exists"
}
```

---

## 📚 ГРУППА 2: Уроки

### 2.1. Получить список всех доступных уроков

**GET** `/lessons`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `include_progress` (boolean, optional) - включить информацию о прогрессе пользователя

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Урок 1: Животные",
      "description": "Изучаем названия животных",
      "order": 1,
      "is_active": true,
      "word_count": 10,
      "is_available": true,
      "progress": {
        "level_1_completed": true,
        "level_2_completed": false,
        "level_3_completed": false,
        "stars": {
          "level_1": "gold",
          "level_2": null,
          "level_3": null
        }
      }
    }
  ]
}
```

**Логика доступности:**
- Первый урок всегда доступен (`is_available: true`)
- Последующие уроки доступны, если пройдены минимум 2 уровня в предыдущем уроке

---

### 2.2. Получить детали урока

**GET** `/lessons/:lessonId`

**Headers:** `Authorization: Bearer {token}`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Урок 1: Животные",
    "description": "Изучаем названия животных",
    "order": 1,
    "word_count": 10,
    "words": [
      {
        "id": 1,
        "english_word": "cat",
        "russian_translation": "кот",
        "audio_file_path": "/uploads/audio/word_1_cat.mp3"
      }
    ]
  }
}
```

---

## 🎮 ГРУППА 3: Уровни

### 3.1. Получить слова для уровня

**GET** `/lessons/:lessonId/levels/:levelNumber/words`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `limit` (number, optional) - количество слов (для пагинации)
- `offset` (number, optional) - смещение

**Описание:** Возвращает слова для уровня согласно алгоритму приоритетов:
1. Слова, которые еще НИКОГДА не были пройдены правильно
2. Слова с неправильными ответами в прошлом
3. Случайные для повторения

**Response 200:**
```json
{
  "success": true,
  "data": {
    "words": [
      {
        "id": 1,
        "english_word": "cat",
        "russian_translation": "кот",
        "audio_file_path": "/uploads/audio/word_1_cat.mp3",
        "is_passed": false
      }
    ],
    "total_words": 10,
    "passed_words": 3
  }
}
```

---

### 3.2. Получить одно слово для уровня (следующее по алгоритму)

**GET** `/lessons/:lessonId/levels/:levelNumber/words/next`

**Headers:** `Authorization: Bearer {token}`

**Описание:** Возвращает следующее слово согласно алгоритму приоритетов

**Response 200:**
```json
{
  "success": true,
  "data": {
    "word": {
      "id": 5,
      "english_word": "dog",
      "russian_translation": "собака",
      "audio_file_path": "/uploads/audio/word_5_dog.mp3"
    },
    "show_in_english": true,
    "answer_options": [
      "кот",
      "собака",
      "птица",
      "рыба",
      "лошадь",
      "мышь"
    ]
  }
}
```

**Примечание:** Для Уровня 1 возвращает варианты ответов, для Уровня 2 и 3 - только слово

---

### 3.3. Проверить ответ (Уровень 1: Тест)

**POST** `/lessons/:lessonId/levels/1/check-answer`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "word_id": 5,
  "selected_answer": "собака"
}
```

**Response 200 (правильный ответ):**
```json
{
  "success": true,
  "data": {
    "is_correct": true,
    "is_new_word": true,
    "reward": {
      "amount": 5,
      "message": "+5₽"
    },
    "progress": {
      "correct_count": 4,
      "total_words": 10,
      "percentage": 40.0
    },
    "audio_file_path": "/uploads/audio/word_5_dog.mp3"
  }
}
```

**Response 200 (неправильный ответ):**
```json
{
  "success": true,
  "data": {
    "is_correct": false,
    "correct_answer": "собака",
    "message": "Попробуй еще раз",
    "audio_file_path": "/uploads/audio/word_5_dog.mp3",
    "progress": {
      "correct_count": 3,
      "total_words": 10,
      "percentage": 30.0
    }
  }
}
```

---

### 3.4. Проверить произношение (Уровень 2: Аудио)

**POST** `/lessons/:lessonId/levels/2/check-pronunciation`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "word_id": 5,
  "spoken_text": "dog"
}
```

**Описание:** `spoken_text` получается через Web Speech API на клиенте

**Response 200 (правильный ответ, 80%+ совпадение):**
```json
{
  "success": true,
  "data": {
    "is_correct": true,
    "similarity": 100.0,
    "is_new_word": true,
    "reward": {
      "amount": 5,
      "message": "+5₽"
    },
    "progress": {
      "correct_count": 4,
      "total_words": 10,
      "percentage": 40.0
    },
    "audio_file_path": "/uploads/audio/word_5_dog.mp3"
  }
}
```

**Response 200 (неправильный ответ, <80% совпадение):**
```json
{
  "success": true,
  "data": {
    "is_correct": false,
    "similarity": 50.0,
    "correct_answer": "dog",
    "message": "Попробуй еще раз",
    "audio_file_path": "/uploads/audio/word_5_dog.mp3",
    "progress": {
      "correct_count": 3,
      "total_words": 10,
      "percentage": 30.0
    }
  }
}
```

---

### 3.5. Проверить написание (Уровень 3: Написание)

**POST** `/lessons/:lessonId/levels/3/check-spelling`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "word_id": 5,
  "typed_text": "dog"
}
```

**Response 200 (правильный ответ, точное совпадение без учета регистра):**
```json
{
  "success": true,
  "data": {
    "is_correct": true,
    "is_new_word": true,
    "reward": {
      "amount": 10,
      "message": "+10₽"
    },
    "progress": {
      "correct_count": 4,
      "total_words": 10,
      "percentage": 40.0
    },
    "audio_file_path": "/uploads/audio/word_5_dog.mp3"
  }
}
```

**Response 200 (неправильный ответ):**
```json
{
  "success": true,
  "data": {
    "is_correct": false,
    "correct_answer": "dog",
    "message": "Попробуй еще раз",
    "audio_file_path": "/uploads/audio/word_5_dog.mp3",
    "progress": {
      "correct_count": 3,
      "total_words": 10,
      "percentage": 30.0
    }
  }
}
```

---

## 📊 ГРУППА 4: Прогресс

### 4.1. Получить прогресс по уровню

**GET** `/lessons/:lessonId/levels/:levelNumber/progress`

**Headers:** `Authorization: Bearer {token}`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "lesson_id": 1,
    "level_number": 1,
    "best_percentage": 70.0,
    "total_correct_answers": 7,
    "total_attempts": 10,
    "is_completed": true,
    "has_gold_star": false,
    "has_diamond_star": false,
    "current_percentage": 70.0,
    "total_words": 10,
    "passed_words": 7
  }
}
```

---

### 4.2. Получить прогресс по всем уровням урока

**GET** `/lessons/:lessonId/progress`

**Headers:** `Authorization: Bearer {token}`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "lesson_id": 1,
    "levels": [
      {
        "level_number": 1,
        "best_percentage": 70.0,
        "is_completed": true,
        "has_gold_star": false,
        "has_diamond_star": false
      },
      {
        "level_number": 2,
        "best_percentage": 0.0,
        "is_completed": false,
        "has_gold_star": false,
        "has_diamond_star": false
      },
      {
        "level_number": 3,
        "best_percentage": 0.0,
        "is_completed": false,
        "has_gold_star": false,
        "has_diamond_star": false
      }
    ]
  }
}
```

---

### 4.3. Получить список всех слов уровня с прогрессом

**GET** `/lessons/:lessonId/levels/:levelNumber/words/all`

**Headers:** `Authorization: Bearer {token}`

**Описание:** Возвращает все слова уровня с информацией о прогрессе (для экрана "Все слова")

**Response 200:**
```json
{
  "success": true,
  "data": {
    "words": [
      {
        "id": 1,
        "english_word": "cat",
        "russian_translation": "кот",
        "audio_file_path": "/uploads/audio/word_1_cat.mp3",
        "is_passed": true,
        "correct_count": 3
      },
      {
        "id": 2,
        "english_word": "dog",
        "russian_translation": "собака",
        "audio_file_path": "/uploads/audio/word_2_dog.mp3",
        "is_passed": false,
        "correct_count": 0
      }
    ]
  }
}
```

---

## 💰 ГРУППА 5: Вознаграждения

### 5.1. Получить общее количество денег пользователя

**GET** `/rewards/total`

**Headers:** `Authorization: Bearer {token}`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "total_money": 150
  }
}
```

---

### 5.2. Получить историю вознаграждений

**GET** `/rewards/history`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `limit` (number, optional, default: 50)
- `offset` (number, optional, default: 0)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "rewards": [
      {
        "id": 1,
        "reward_type": "word",
        "amount": 5,
        "lesson_id": 1,
        "word_id": 5,
        "level_number": 1,
        "created_at": "2024-01-20T10:00:00Z"
      },
      {
        "id": 2,
        "reward_type": "level_90",
        "amount": 100,
        "lesson_id": 1,
        "level_number": 1,
        "created_at": "2024-01-20T11:00:00Z"
      }
    ],
    "total": 2
  }
}
```

---

## 🎵 ГРУППА 6: Аудио файлы

### 6.1. Получить аудио файл

**GET** `/audio/:wordId`

**Описание:** Возвращает аудио файл для прослушивания

**Response 200:**
- Content-Type: `audio/mpeg`
- Binary data (MP3 file)

**Response 404:**
```json
{
  "success": false,
  "error": "Audio file not found"
}
```

---

## 👨‍💼 ГРУППА 7: Администратор - Авторизация

### 7.1. Вход администратора

**POST** `/admin/auth/login`

**Request Body:**
```json
{
  "login": "admin",
  "password": "password123"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "admin": {
      "id": 1,
      "login": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Response 401:**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

---

### 7.2. Получить текущего администратора

**GET** `/admin/auth/me`

**Headers:** `Authorization: Bearer {admin_token}`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "login": "admin",
    "created_at": "2024-01-01T00:00:00Z",
    "last_login": "2024-01-20T15:00:00Z"
  }
}
```

---

## 📚 ГРУППА 8: Администратор - Уроки

### 8.1. Получить список всех уроков

**GET** `/admin/lessons`

**Headers:** `Authorization: Bearer {admin_token}`

**Query Parameters:**
- `search` (string, optional) - поиск по названию
- `page` (number, optional, default: 1)
- `limit` (number, optional, default: 20)
- `sort` (string, optional) - сортировка (name, created_at, order)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "lessons": [
      {
        "id": 1,
        "name": "Урок 1: Животные",
        "description": "Изучаем названия животных",
        "order": 1,
        "is_active": true,
        "word_count": 10,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "total_pages": 1
    }
  }
}
```

---

### 8.2. Получить детали урока

**GET** `/admin/lessons/:lessonId`

**Headers:** `Authorization: Bearer {admin_token}`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Урок 1: Животные",
    "description": "Изучаем названия животных",
    "order": 1,
    "is_active": true,
    "words": [
      {
        "id": 1,
        "english_word": "cat",
        "russian_translation": "кот"
      }
    ],
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  }
}
```

---

### 8.3. Создать урок

**POST** `/admin/lessons`

**Headers:** `Authorization: Bearer {admin_token}`

**Request Body:**
```json
{
  "name": "Урок 2: Еда",
  "description": "Изучаем названия еды",
  "order": 2,
  "is_active": true,
  "word_ids": [1, 2, 3, 5, 7]
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Урок 2: Еда",
    "description": "Изучаем названия еды",
    "order": 2,
    "is_active": true,
    "word_count": 5,
    "created_at": "2024-01-20T16:00:00Z"
  }
}
```

---

### 8.4. Обновить урок

**PUT** `/admin/lessons/:lessonId`

**Headers:** `Authorization: Bearer {admin_token}`

**Request Body:**
```json
{
  "name": "Урок 1: Животные (обновлено)",
  "description": "Новое описание",
  "order": 1,
  "is_active": true,
  "word_ids": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Урок 1: Животные (обновлено)",
    "description": "Новое описание",
    "order": 1,
    "is_active": true,
    "word_count": 10,
    "updated_at": "2024-01-20T16:30:00Z"
  }
}
```

---

### 8.5. Удалить урок

**DELETE** `/admin/lessons/:lessonId`

**Headers:** `Authorization: Bearer {admin_token}`

**Response 200:**
```json
{
  "success": true,
  "message": "Lesson deleted successfully"
}
```

**Response 400:**
```json
{
  "success": false,
  "error": "Cannot delete lesson with associated words"
}
```

---

## 📝 ГРУППА 9: Администратор - Слова

### 9.1. Получить список всех слов

**GET** `/admin/words`

**Headers:** `Authorization: Bearer {admin_token}`

**Query Parameters:**
- `lesson_id` (number, optional) - фильтр по уроку
- `search` (string, optional) - поиск по английскому или русскому слову
- `page` (number, optional, default: 1)
- `limit` (number, optional, default: 20)
- `sort` (string, optional) - сортировка

**Response 200:**
```json
{
  "success": true,
  "data": {
    "words": [
      {
        "id": 1,
        "english_word": "cat",
        "russian_translation": "кот",
        "lesson_id": 1,
        "lesson_name": "Урок 1: Животные",
        "audio_file_path": "/uploads/audio/word_1_cat.mp3",
        "audio_file_name": "cat.mp3",
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "total_pages": 3
    }
  }
}
```

---

### 9.2. Получить детали слова

**GET** `/admin/words/:wordId`

**Headers:** `Authorization: Bearer {admin_token}`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "english_word": "cat",
    "russian_translation": "кот",
    "lesson_id": 1,
    "lesson_name": "Урок 1: Животные",
    "audio_file_path": "/uploads/audio/word_1_cat.mp3",
    "audio_file_name": "cat.mp3",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

### 9.3. Создать слово

**POST** `/admin/words`

**Headers:** `Authorization: Bearer {admin_token}`

**Request Body (multipart/form-data):**
```
english_word: "cat"
russian_translation: "кот"
lesson_id: 1
audio_file: [binary file]
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "english_word": "cat",
    "russian_translation": "кот",
    "lesson_id": 1,
    "audio_file_path": "/uploads/audio/word_1_cat.mp3",
    "audio_file_name": "cat.mp3",
    "created_at": "2024-01-20T17:00:00Z"
  }
}
```

**Response 400:**
```json
{
  "success": false,
  "error": "Invalid audio file format. Only MP3 is allowed"
}
```

---

### 9.4. Обновить слово

**PUT** `/admin/words/:wordId`

**Headers:** `Authorization: Bearer {admin_token}`

**Request Body (multipart/form-data, все поля опциональны):**
```
english_word: "cat"
russian_translation: "кот"
lesson_id: 1
audio_file: [binary file] (опционально, только если нужно заменить)
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "english_word": "cat",
    "russian_translation": "кот",
    "lesson_id": 1,
    "audio_file_path": "/uploads/audio/word_1_cat.mp3",
    "updated_at": "2024-01-20T17:30:00Z"
  }
}
```

---

### 9.5. Удалить слово

**DELETE** `/admin/words/:wordId`

**Headers:** `Authorization: Bearer {admin_token}`

**Response 200:**
```json
{
  "success": true,
  "message": "Word deleted successfully"
}
```

---

### 9.6. Массовое удаление слов

**DELETE** `/admin/words/batch`

**Headers:** `Authorization: Bearer {admin_token}`

**Request Body:**
```json
{
  "word_ids": [1, 2, 3, 5, 7]
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "deleted_count": 5
  }
}
```

---

### 9.7. Массовое перемещение слов в другой урок

**PUT** `/admin/words/batch/move`

**Headers:** `Authorization: Bearer {admin_token}`

**Request Body:**
```json
{
  "word_ids": [1, 2, 3],
  "lesson_id": 2
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "moved_count": 3
  }
}
```

---

## 📊 ГРУППА 10: Администратор - Статистика (опционально)

### 10.1. Получить общую статистику

**GET** `/admin/statistics`

**Headers:** `Authorization: Bearer {admin_token}`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "total_users": 150,
    "total_lessons": 10,
    "total_words": 200,
    "total_completed_levels": 450,
    "total_rewards_given": 5000
  }
}
```

---

### 10.2. Получить статистику по уроку

**GET** `/admin/lessons/:lessonId/statistics`

**Headers:** `Authorization: Bearer {admin_token}`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "lesson_id": 1,
    "users_completed": 50,
    "average_percentage": 75.5,
    "most_difficult_words": [
      {
        "word_id": 5,
        "english_word": "dog",
        "error_rate": 30.5
      }
    ]
  }
}
```

---

## ✅ Валидация запросов

### Общие правила валидации:

**Все обязательные поля должны быть заполнены**

**Типы данных:**
- `string` - строка (не пустая, если не указано иное)
- `number` - число (целое или с плавающей точкой)
- `boolean` - булево значение (true/false)
- `array` - массив
- `file` - файл (для multipart/form-data)

**Коды ошибок валидации:**
- `400` - Ошибка валидации (неправильный формат, отсутствуют обязательные поля)
- `422` - Ошибка валидации данных (логические ошибки, например: урок не существует)

---

### Детальная валидация по эндпоинтам:

#### 1. POST `/auth/user/login`
**Обязательные поля:**
- `login` (string, required, min: 1, max: 100)

**Валидация:**
- `login` не может быть пустым
- `login` не может содержать только пробелы
- `login` должен быть уникальным (при создании нового пользователя)

**Ошибки:**
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": {
    "login": "Login is required and cannot be empty"
  }
}
```

---

#### 2. POST `/auth/user/register`
**Обязательные поля:**
- `login` (string, required, min: 1, max: 100)

**Валидация:**
- `login` не может быть пустым
- `login` не может содержать только пробелы
- `login` должен быть уникальным

**Ошибки:**
```json
{
  "success": false,
  "error": "User with this login already exists"
}
```

---

#### 3. GET `/lessons/:lessonId/levels/:levelNumber/words`
**Параметры пути:**
- `lessonId` (number, required, must exist)
- `levelNumber` (number, required, must be 1, 2 or 3)

**Query параметры:**
- `limit` (number, optional, min: 1, max: 100, default: 10)
- `offset` (number, optional, min: 0, default: 0)

**Валидация:**
- `lessonId` должен существовать в базе данных
- `levelNumber` должен быть 1, 2 или 3

**Ошибки:**
```json
{
  "success": false,
  "error": "Lesson not found"
}
```

---

#### 4. POST `/lessons/:lessonId/levels/1/check-answer`
**Параметры пути:**
- `lessonId` (number, required, must exist)

**Обязательные поля:**
- `word_id` (number, required, must exist)
- `selected_answer` (string, required, min: 1)

**Валидация:**
- `word_id` должен существовать в базе данных
- `word_id` должен принадлежать указанному уроку
- `selected_answer` не может быть пустым

**Ошибки:**
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": {
    "word_id": "Word not found",
    "selected_answer": "Selected answer is required"
  }
}
```

---

#### 5. POST `/lessons/:lessonId/levels/2/check-pronunciation`
**Параметры пути:**
- `lessonId` (number, required, must exist)

**Обязательные поля:**
- `word_id` (number, required, must exist)
- `spoken_text` (string, required, min: 1, max: 255)

**Валидация:**
- `word_id` должен существовать в базе данных
- `word_id` должен принадлежать указанному уроку
- `spoken_text` не может быть пустым

**Ошибки:**
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": {
    "spoken_text": "Spoken text is required"
  }
}
```

---

#### 6. POST `/lessons/:lessonId/levels/3/check-spelling`
**Параметры пути:**
- `lessonId` (number, required, must exist)

**Обязательные поля:**
- `word_id` (number, required, must exist)
- `typed_text` (string, required, min: 1, max: 255)

**Валидация:**
- `word_id` должен существовать в базе данных
- `word_id` должен принадлежать указанному уроку
- `typed_text` не может быть пустым

**Ошибки:**
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": {
    "typed_text": "Typed text is required"
  }
}
```

---

#### 7. POST `/admin/auth/login`
**Обязательные поля:**
- `login` (string, required, min: 1, max: 100)
- `password` (string, required, min: 1)

**Валидация:**
- `login` не может быть пустым
- `password` не может быть пустым

**Ошибки:**
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": {
    "login": "Login is required",
    "password": "Password is required"
  }
}
```

---

#### 8. POST `/admin/lessons`
**Обязательные поля:**
- `name` (string, required, min: 1, max: 255)
- `word_ids` (array, optional) - массив ID слов

**Опциональные поля:**
- `description` (string, optional, max: 1000)
- `order` (number, optional, min: 0)
- `is_active` (boolean, optional, default: true)

**Валидация:**
- `name` не может быть пустым
- `name` должен быть уникальным (или можно разрешить дубликаты?)
- `word_ids` должен быть массивом чисел
- Все `word_ids` должны существовать в базе данных
- `order` должен быть неотрицательным числом

**Ошибки:**
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": {
    "name": "Name is required and cannot be empty",
    "word_ids": "Some words not found"
  }
}
```

---

#### 9. PUT `/admin/lessons/:lessonId`
**Параметры пути:**
- `lessonId` (number, required, must exist)

**Опциональные поля (все опциональны при обновлении):**
- `name` (string, optional, min: 1, max: 255)
- `description` (string, optional, max: 1000)
- `order` (number, optional, min: 0)
- `is_active` (boolean, optional)
- `word_ids` (array, optional) - массив ID слов

**Валидация:**
- `lessonId` должен существовать в базе данных
- Если `name` указан, он не может быть пустым
- Если `word_ids` указан, все ID должны существовать

**Ошибки:**
```json
{
  "success": false,
  "error": "Lesson not found"
}
```

---

#### 10. POST `/admin/words`
**Обязательные поля (multipart/form-data):**
- `english_word` (string, required, min: 1, max: 255)
- `russian_translation` (string, required, min: 1, max: 255)
- `lesson_id` (number, required, must exist)
- `audio_file` (file, required)

**Валидация:**
- `english_word` не может быть пустым
- `russian_translation` не может быть пустым
- `lesson_id` должен существовать в базе данных
- `audio_file` обязателен
- `audio_file` должен быть формата MP3
- `audio_file` размер не должен превышать 5 МБ

**Ошибки:**
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": {
    "english_word": "English word is required",
    "russian_translation": "Russian translation is required",
    "lesson_id": "Lesson not found",
    "audio_file": "Audio file is required and must be MP3 format (max 5MB)"
  }
}
```

---

#### 11. PUT `/admin/words/:wordId`
**Параметры пути:**
- `wordId` (number, required, must exist)

**Опциональные поля (multipart/form-data):**
- `english_word` (string, optional, min: 1, max: 255)
- `russian_translation` (string, optional, min: 1, max: 255)
- `lesson_id` (number, optional, must exist)
- `audio_file` (file, optional)

**Валидация:**
- `wordId` должен существовать в базе данных
- Если `english_word` указан, он не может быть пустым
- Если `russian_translation` указан, он не может быть пустым
- Если `lesson_id` указан, он должен существовать
- Если `audio_file` указан, он должен быть MP3 и не превышать 5 МБ

**Ошибки:**
```json
{
  "success": false,
  "error": "Word not found"
}
```

---

#### 12. DELETE `/admin/words/batch`
**Обязательные поля:**
- `word_ids` (array, required, min: 1)

**Валидация:**
- `word_ids` должен быть массивом чисел
- `word_ids` не может быть пустым
- Все `word_ids` должны существовать в базе данных

**Ошибки:**
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": {
    "word_ids": "Word IDs array is required and cannot be empty"
  }
}
```

---

#### 13. PUT `/admin/words/batch/move`
**Обязательные поля:**
- `word_ids` (array, required, min: 1)
- `lesson_id` (number, required, must exist)

**Валидация:**
- `word_ids` должен быть массивом чисел
- `word_ids` не может быть пустым
- `lesson_id` должен существовать в базе данных
- Все `word_ids` должны существовать в базе данных

**Ошибки:**
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": {
    "word_ids": "Word IDs array is required",
    "lesson_id": "Lesson not found"
  }
}
```

---

### Общие ошибки валидации:

**Формат ответа при ошибке валидации:**
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": {
    "field_name": "Error message",
    "another_field": "Another error message"
  }
}
```

**Примеры общих ошибок:**
- Отсутствует обязательное поле
- Неправильный тип данных
- Значение вне допустимого диапазона
- Нарушение уникальности
- Связанная сущность не найдена
- Файл неправильного формата или размера

---

## ✅ Итоговая сводка

### Всего endpoints: ~35

**Пользовательские:**
- Авторизация: 3 endpoints
- Уроки: 2 endpoints
- Уровни: 5 endpoints
- Прогресс: 3 endpoints
- Вознаграждения: 2 endpoints
- Аудио: 1 endpoint

**Администраторские:**
- Авторизация: 2 endpoints
- Уроки: 5 endpoints
- Слова: 7 endpoints
- Статистика: 2 endpoints (опционально)

### Готово к реализации!

Все endpoints описаны с:
- ✅ Методами HTTP
- ✅ Путями
- ✅ Параметрами запросов
- ✅ Форматами ответов
- ✅ Кодами ошибок
- ✅ **Валидацией всех полей** ⭐ **НОВОЕ**

---

## 🔄 Следующие шаги

1. Создать миграции базы данных
2. Реализовать модели данных
3. Реализовать контроллеры для каждого endpoint
4. **Настроить валидацию запросов** (используя class-validator, Joi, или аналогичные библиотеки)
5. Настроить аутентификацию (JWT)
6. Протестировать все endpoints

