# Сводка по Entities

## ✅ Создано 8 Entities:

1. **Lesson** (`src/modules/lessons/entities/lesson.entity.ts`)
   - Уроки приложения
   - Связь: OneToMany с Word

2. **Word** (`src/modules/words/entities/word.entity.ts`)
   - Слова с переводами и аудио
   - Связь: ManyToOne с Lesson

3. **User** (`src/modules/users/entities/user.entity.ts`)
   - Пользователи приложения (только логин, без пароля)

4. **Admin** (`src/modules/admin/entities/admin.entity.ts`)
   - Администраторы (логин + пароль)

5. **LevelProgress** (`src/modules/progress/entities/level-progress.entity.ts`)
   - Прогресс пользователя по уровням
   - Уникальный ключ: user_id + lesson_id + level_number

6. **WordProgress** (`src/modules/progress/entities/word-progress.entity.ts`)
   - Прогресс пользователя по словам
   - Уникальный ключ: user_id + word_id + level_number

7. **Reward** (`src/modules/progress/entities/reward.entity.ts`)
   - Вознаграждения (деньги)
   - Уникальный ключ: user_id + reward_type + lesson_id + word_id + level_number
   - Enum: RewardType (word, level_90, level_100)

8. **AdminLog** (`src/modules/admin/entities/admin-log.entity.ts`)
   - Логи действий администраторов

## 📋 Следующие шаги:

1. Создать первую миграцию для всех таблиц
2. Применить миграцию к базе данных
3. Начать реализацию модулей (Auth, Lessons, Words, etc.)

## 🔍 Проверка:

Все entities соответствуют схеме из `database-schema.md`:
- ✅ Все поля созданы
- ✅ Все связи настроены
- ✅ Все индексы добавлены
- ✅ Все уникальные ключи настроены
- ✅ CASCADE удаление настроено правильно

