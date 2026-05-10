# СТРУКТУРА БАЗЫ ДАННЫХ

## 📊 Общая информация

**СУБД:** PostgreSQL / MySQL / SQLite (на выбор)

**Кодировка:** UTF-8 (для поддержки русского и английского языков)

---

## 📋 Список таблиц

1. **lessons** - Уроки
2. **words** - Слова
3. **users** - Пользователи приложения
4. **admins** - Администраторы
5. **level_progress** - Прогресс по уровням (для каждого пользователя)
6. **word_progress** - Прогресс по словам (для каждого пользователя, слова и уровня)
7. **rewards** - Вознаграждения (деньги)
8. **admin_logs** - Логи действий администраторов

---

## 🗄️ Детальная структура таблиц

### 1. Таблица: `lessons` (Уроки)

**Описание:** Хранит информацию об уроках

| Поле | Тип | Ограничения | Описание |
|------|-----|-------------|----------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Уникальный идентификатор урока |
| `name` | VARCHAR(255) | NOT NULL | Название урока (например: "Урок 1: Животные") |
| `description` | TEXT | NULL | Описание урока (опционально) |
| `order` | INT | NULL, DEFAULT 0 | Порядок отображения на главном экране |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | Активен ли урок (отображается пользователям) |
| `created_at` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Дата и время создания |
| `updated_at` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Дата и время последнего изменения |

**Индексы:**
- PRIMARY KEY (`id`)
- INDEX `idx_order` (`order`)
- INDEX `idx_is_active` (`is_active`)

---

### 2. Таблица: `words` (Слова)

**Описание:** Хранит слова с переводами и аудио файлами

| Поле | Тип | Ограничения | Описание |
|------|-----|-------------|----------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Уникальный идентификатор слова |
| `english_word` | VARCHAR(255) | NOT NULL | Английское слово |
| `russian_translation` | VARCHAR(255) | NOT NULL | Русский перевод |
| `lesson_id` | INT | NOT NULL, FOREIGN KEY -> lessons.id | ID урока, к которому относится слово |
| `audio_file_path` | VARCHAR(500) | NOT NULL | Путь к аудио файлу на сервере (например: "/uploads/audio/word_123_hello.mp3") |
| `audio_file_name` | VARCHAR(255) | NULL | Оригинальное имя файла (для справки) |
| `created_at` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Дата и время создания |
| `updated_at` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Дата и время последнего изменения |

**Индексы:**
- PRIMARY KEY (`id`)
- FOREIGN KEY `fk_words_lesson` (`lesson_id`) REFERENCES `lessons`(`id`) ON DELETE CASCADE
- INDEX `idx_lesson_id` (`lesson_id`)
- INDEX `idx_english_word` (`english_word`)
- INDEX `idx_russian_translation` (`russian_translation`)

**Примечания:**
- Одно слово может принадлежать только одному уроку (связь один-ко-многим: один урок - много слов)
- При удалении урока удаляются все связанные слова (CASCADE)

---

### 3. Таблица: `users` (Пользователи)

**Описание:** Хранит информацию о пользователях приложения

| Поле | Тип | Ограничения | Описание |
|------|-----|-------------|----------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Уникальный идентификатор пользователя |
| `login` | VARCHAR(100) | NOT NULL, UNIQUE | Логин пользователя (уникальный) |
| `total_money` | INT | NOT NULL, DEFAULT 0 | Общее количество заработанных денег (сумма всех вознаграждений) |
| `created_at` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Дата и время регистрации |
| `last_login` | timestamp | NULL | Дата и время последнего входа |

**Индексы:**
- PRIMARY KEY (`id`)
- UNIQUE KEY `uk_login` (`login`)
- INDEX `idx_login` (`login`)

**Примечания:**
- Пароль НЕ хранится (вход только по логину)
- `total_money` - вычисляемое поле, можно получать через SUM из таблицы rewards, но для производительности храним отдельно

---

### 4. Таблица: `admins` (Администраторы)

**Описание:** Хранит информацию об администраторах кабинета

| Поле | Тип | Ограничения | Описание |
|------|-----|-------------|----------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Уникальный идентификатор администратора |
| `login` | VARCHAR(100) | NOT NULL, UNIQUE | Логин администратора (уникальный) |
| `password_hash` | VARCHAR(255) | NOT NULL | Хеш пароля (bcrypt, длина ~60 символов) |
| `created_at` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Дата и время создания |
| `last_login` | timestamp | NULL | Дата и время последнего входа |

**Индексы:**
- PRIMARY KEY (`id`)
- UNIQUE KEY `uk_admin_login` (`login`)

**Примечания:**
- Пароль хранится в виде хеша (bcrypt)
- Вход требует логин + пароль

---

### 5. Таблица: `level_progress` (Прогресс по уровням)

**Описание:** Хранит прогресс пользователя по каждому уровню каждого урока

| Поле | Тип | Ограничения | Описание |
|------|-----|-------------|----------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Уникальный идентификатор записи |
| `user_id` | INT | NOT NULL, FOREIGN KEY -> users.id | ID пользователя |
| `lesson_id` | INT | NOT NULL, FOREIGN KEY -> lessons.id | ID урока |
| `level_number` | TINYINT | NOT NULL | Номер уровня (1, 2 или 3) |
| `best_percentage` | DECIMAL(5,2) | NOT NULL, DEFAULT 0.00 | Лучший достигнутый процент правильных ответов (0.00 - 100.00) |
| `total_correct_answers` | INT | NOT NULL, DEFAULT 0 | Сколько всего правильных ответов дал за ВСЁ время в этом уровне |
| `total_attempts` | INT | NOT NULL, DEFAULT 0 | Сколько всего попыток было за ВСЁ время (правильные + неправильные) |
| `is_completed` | BOOLEAN | NOT NULL, DEFAULT FALSE | Статус "пройден" (достигнут ли 70%) |
| `has_gold_star` | BOOLEAN | NOT NULL, DEFAULT FALSE | Получена ли уже золотая звезда (за 90%) |
| `has_diamond_star` | BOOLEAN | NOT NULL, DEFAULT FALSE | Получен ли уже бриллиант (за 100%) |
| `first_started_at` | timestamp | NULL | Когда впервые начал уровень |
| `last_played_at` | timestamp | NULL | Когда последний раз играл |

**Индексы:**
- PRIMARY KEY (`id`)
- FOREIGN KEY `fk_level_progress_user` (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
- FOREIGN KEY `fk_level_progress_lesson` (`lesson_id`) REFERENCES `lessons`(`id`) ON DELETE CASCADE
- UNIQUE KEY `uk_user_lesson_level` (`user_id`, `lesson_id`, `level_number`)
- INDEX `idx_user_id` (`user_id`)
- INDEX `idx_lesson_id` (`lesson_id`)

**Примечания:**
- Уникальная комбинация: один пользователь - один урок - один уровень (UNIQUE KEY)
- При удалении пользователя удаляется весь его прогресс (CASCADE)
- При удалении урока удаляется весь прогресс по этому уроку (CASCADE)
- `level_number` может быть только 1, 2 или 3

---

### 6. Таблица: `word_progress` (Прогресс по словам)

**Описание:** Хранит прогресс пользователя по каждому слову в каждом уровне

| Поле | Тип | Ограничения | Описание |
|------|-----|-------------|----------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Уникальный идентификатор записи |
| `user_id` | INT | NOT NULL, FOREIGN KEY -> users.id | ID пользователя |
| `word_id` | INT | NOT NULL, FOREIGN KEY -> words.id | ID слова |
| `lesson_id` | INT | NOT NULL, FOREIGN KEY -> lessons.id | ID урока (для быстрого доступа) |
| `level_number` | TINYINT | NOT NULL | Номер уровня (1, 2 или 3) |
| `is_passed` | BOOLEAN | NOT NULL, DEFAULT FALSE | Факт: "Это слово хоть раз было пройдено правильно в этом уровне" |
| `correct_count` | INT | NOT NULL, DEFAULT 0 | Сколько раз правильно отвечал на это слово |
| `first_correct_at` | timestamp | NULL | Когда впервые правильно ответил на это слово |
| `last_correct_at` | timestamp | NULL | Когда последний раз правильно ответил |

**Индексы:**
- PRIMARY KEY (`id`)
- FOREIGN KEY `fk_word_progress_user` (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
- FOREIGN KEY `fk_word_progress_word` (`word_id`) REFERENCES `words`(`id`) ON DELETE CASCADE
- FOREIGN KEY `fk_word_progress_lesson` (`lesson_id`) REFERENCES `lessons`(`id`) ON DELETE CASCADE
- UNIQUE KEY `uk_user_word_level` (`user_id`, `word_id`, `level_number`)
- INDEX `idx_user_id` (`user_id`)
- INDEX `idx_word_id` (`word_id`)
- INDEX `idx_lesson_level` (`lesson_id`, `level_number`)
- INDEX `idx_is_passed` (`is_passed`)

**Примечания:**
- Уникальная комбинация: один пользователь - одно слово - один уровень (UNIQUE KEY)
- При удалении пользователя удаляется весь его прогресс по словам (CASCADE)
- При удалении слова удаляется весь прогресс по этому слову (CASCADE)
- `level_number` может быть только 1, 2 или 3
- `lesson_id` дублируется для быстрого доступа (можно получить через word.lesson_id, но для производительности храним отдельно)

---

### 7. Таблица: `rewards` (Вознаграждения)

**Описание:** Хранит все факты получения денег пользователями (защита от дублирования)

| Поле | Тип | Ограничения | Описание |
|------|-----|-------------|----------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Уникальный идентификатор записи |
| `user_id` | INT | NOT NULL, FOREIGN KEY -> users.id | ID пользователя |
| `reward_type` | ENUM('word', 'level_90', 'level_100') | NOT NULL | Тип вознаграждения: 'word' (за слово), 'level_90' (за 90%), 'level_100' (за 100%) |
| `lesson_id` | INT | NULL, FOREIGN KEY -> lessons.id | ID урока (обязательно для level_90 и level_100) |
| `word_id` | INT | NULL, FOREIGN KEY -> words.id | ID слова (обязательно для reward_type='word') |
| `level_number` | TINYINT | NULL | Номер уровня (обязательно для всех типов) |
| `amount` | INT | NOT NULL | Сумма вознаграждения (5, 100 или 150 рублей) |
| `created_at` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Дата и время получения вознаграждения |

**Индексы:**
- PRIMARY KEY (`id`)
- FOREIGN KEY `fk_rewards_user` (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
- FOREIGN KEY `fk_rewards_lesson` (`lesson_id`) REFERENCES `lessons`(`id`) ON DELETE CASCADE
- FOREIGN KEY `fk_rewards_word` (`word_id`) REFERENCES `words`(`id`) ON DELETE CASCADE
- UNIQUE KEY `uk_reward_unique` (`user_id`, `reward_type`, `lesson_id`, `word_id`, `level_number`)
- INDEX `idx_user_id` (`user_id`)
- INDEX `idx_reward_type` (`reward_type`)

**Примечания:**
- **Уникальный ключ** предотвращает получение одного и того же вознаграждения дважды
- Для `reward_type='word'`: обязательны `word_id` и `level_number`
- Для `reward_type='level_90'` или `level_100'`: обязательны `lesson_id` и `level_number`, `word_id` = NULL
- `amount` может быть: 5 (за слово), 100 (за 90%), 150 (за 100%)
- При удалении пользователя удаляются все его вознаграждения (CASCADE)

**Примеры записей:**
- Пользователь X получил 5₽ за слово Y в уровне 1 урока Z: `(user_id=X, reward_type='word', word_id=Y, level_number=1, amount=5)`
- Пользователь X получил 100₽ за достижение 90% в уровне 1 урока Z: `(user_id=X, reward_type='level_90', lesson_id=Z, level_number=1, amount=100)`
- Пользователь X получил 150₽ за достижение 100% в уровне 2 урока Z: `(user_id=X, reward_type='level_100', lesson_id=Z, level_number=2, amount=150)`

---

### 8. Таблица: `admin_logs` (Логи действий администраторов)

**Описание:** Хранит логи всех действий администраторов для аудита

| Поле | Тип | Ограничения | Описание |
|------|-----|-------------|----------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Уникальный идентификатор записи |
| `admin_id` | INT | NOT NULL, FOREIGN KEY -> admins.id | ID администратора |
| `action` | VARCHAR(50) | NOT NULL | Действие (create, update, delete) |
| `entity_type` | VARCHAR(50) | NOT NULL | Тип сущности (lesson, word, user, admin) |
| `entity_id` | INT | NULL | ID сущности (если применимо) |
| `details` | JSON | NULL | Детали действия в формате JSON (старые/новые значения) |
| `ip_address` | VARCHAR(45) | NULL | IP адрес администратора |
| `created_at` | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Дата и время действия |

**Индексы:**
- PRIMARY KEY (`id`)
- FOREIGN KEY `fk_admin_logs_admin` (`admin_id`) REFERENCES `admins`(`id`) ON DELETE SET NULL
- INDEX `idx_admin_id` (`admin_id`)
- INDEX `idx_entity` (`entity_type`, `entity_id`)
- INDEX `idx_created_at` (`created_at`)

**Примечания:**
- При удалении администратора логи сохраняются (SET NULL для admin_id)
- `details` хранит JSON с дополнительной информацией (например: `{"old_name": "Урок 1", "new_name": "Урок 1: Животные"}`)

---

## 🔗 Связи между таблицами (ER-диаграмма)

```
lessons (1) ────< (N) words
  │
  │
  └───< (N) level_progress
  │
  └───< (N) word_progress
  │
  └───< (N) rewards

users (1) ────< (N) level_progress
  │
  ├───< (N) word_progress
  │
  └───< (N) rewards

words (1) ────< (N) word_progress
  │
  └───< (N) rewards

admins (1) ────< (N) admin_logs
```

**Обозначения:**
- `(1)` - один
- `(N)` - много
- `─` - связь
- `<` - направление связи

---

## 📊 Примеры запросов

### Получить все слова урока:
```sql
SELECT * FROM words WHERE lesson_id = 1 ORDER BY id;
```

### Получить прогресс пользователя по уровню:
```sql
SELECT * FROM level_progress 
WHERE user_id = 1 AND lesson_id = 1 AND level_number = 1;
```

### Получить все непройденные слова для пользователя в уровне:
```sql
SELECT w.* FROM words w
LEFT JOIN word_progress wp ON w.id = wp.word_id 
  AND wp.user_id = 1 AND wp.level_number = 1 AND wp.is_passed = TRUE
WHERE w.lesson_id = 1 AND wp.id IS NULL;
```

### Получить общую сумму денег пользователя:
```sql
SELECT COALESCE(SUM(amount), 0) as total_money 
FROM rewards 
WHERE user_id = 1;
```

### Проверить, получил ли пользователь вознаграждение за слово:
```sql
SELECT COUNT(*) > 0 as has_reward
FROM rewards
WHERE user_id = 1 
  AND reward_type = 'word' 
  AND word_id = 5 
  AND level_number = 1;
```

---

## 🔄 Миграции базы данных

### Создание таблиц (порядок важен из-за внешних ключей):

1. `lessons`
2. `words` (зависит от `lessons`)
3. `users`
4. `admins`
5. `level_progress` (зависит от `users` и `lessons`)
6. `word_progress` (зависит от `users`, `words` и `lessons`)
7. `rewards` (зависит от `users`, `lessons` и `words`)
8. `admin_logs` (зависит от `admins`)

---

## ✅ Итоговая сводка

### Все таблицы описаны:
- ✅ `lessons` - Уроки
- ✅ `words` - Слова
- ✅ `users` - Пользователи
- ✅ `admins` - Администраторы
- ✅ `level_progress` - Прогресс по уровням
- ✅ `word_progress` - Прогресс по словам
- ✅ `rewards` - Вознаграждения
- ✅ `admin_logs` - Логи администраторов

### Все связи определены:
- ✅ Урок → Слова (один-ко-многим)
- ✅ Пользователь → Прогресс по уровням (один-ко-многим)
- ✅ Пользователь → Прогресс по словам (один-ко-многим)
- ✅ Пользователь → Вознаграждения (один-ко-многим)
- ✅ Администратор → Логи (один-ко-многим)

### Все уникальные ключи определены:
- ✅ Предотвращение дублирования вознаграждений
- ✅ Уникальность логинов пользователей и администраторов
- ✅ Уникальность прогресса по уровням и словам

---

## 🎯 Готово к использованию

Схема базы данных полностью готова для создания миграций и начала разработки!

