# Inglish App - Backend

Backend приложение для изучения английского языка на NestJS.

## 🚀 Быстрый старт

### Установка зависимостей

```bash
npm install
```

### Настройка окружения

Скопируйте `.env.example` в `.env` и заполните необходимые переменные:

```bash
cp .env.example .env
```

### Запуск базы данных

Убедитесь, что PostgreSQL запущен и создана база данных.

### Применение миграций

```bash
npm run migration:run
```

### Запуск приложения

**Development:**
```bash
npm run start:dev
```

**Production:**
```bash
npm run build
npm run start:prod
```

## 📚 Документация API

После запуска приложения документация Swagger доступна по адресу:
- http://localhost:3000/api/docs

## 🗄️ Миграции

**Создать новую миграцию:**
```bash
npm run migration:generate -- src/migrations/MigrationName
```

**Применить миграции:**
```bash
npm run migration:run
```

**Откатить последнюю миграцию:**
```bash
npm run migration:revert
```

## 🧪 Тестирование

```bash
# Unit тесты
npm run test

# E2E тесты
npm run test:e2e

# Покрытие кода
npm run test:cov
```

## 📁 Структура проекта

```
src/
├── modules/          # Модули приложения
│   ├── auth/         # Авторизация
│   ├── lessons/      # Уроки
│   ├── words/        # Слова
│   ├── users/        # Пользователи
│   ├── admin/        # Администраторы
│   └── progress/     # Прогресс
├── common/           # Общие утилиты
├── config/           # Конфигурация
└── main.ts          # Точка входа
```

## 🔒 Безопасность

- ✅ CORS настроен правильно (не `origin: true`)
- ✅ `synchronize: false` (используются миграции)
- ✅ Валидация всех входных данных
- ✅ Rate limiting настроен
- ✅ JWT аутентификация

## 📝 Важные замечания

1. **НЕ используйте `synchronize: true` в production!**
2. **Всегда используйте миграции для изменения схемы БД**
3. **Не коммитьте `.env` файл**
4. **Используйте переменные окружения для всех секретов**

