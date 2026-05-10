# Инструкция по установке Backend проекта

## 📋 Предварительные требования

- Node.js >= 18.x
- npm >= 9.x
- PostgreSQL >= 14.x (или MySQL 8.x)

## 🚀 Установка

### 1. Установка зависимостей

```bash
cd backend
npm install
```

### 2. Настройка базы данных

Создайте базу данных PostgreSQL:

```sql
CREATE DATABASE inglish_app;
```

### 3. Настройка переменных окружения

Создайте файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

Отредактируйте `.env` и укажите правильные данные для подключения к БД:

```env
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=inglish_app

JWT_SECRET=your-secret-key-change-in-production
ADMIN_JWT_SECRET=your-admin-secret-key-change-in-production
```

### 4. Применение миграций

После создания всех entities и миграций:

```bash
npm run migration:run
```

### 5. Создание первого администратора

После применения миграций создайте первого администратора:

```bash
npm run create:admin [login] [password]
```

Пример:
```bash
npm run create:admin admin admin123
```

Если не указать параметры, будут использованы значения по умолчанию:
- login: `admin`
- password: `admin123`

**⚠️ Важно:** Измените пароль после первого входа!

### 6. Запуск приложения

**Development режим:**
```bash
npm run start:dev
```

Приложение будет доступно по адресу: http://localhost:3000

**Swagger документация:**
http://localhost:3000/api/docs

## 📝 Следующие шаги

1. Создать все Entities (на основе `database-schema.md`)
2. Создать миграции
3. Реализовать модули:
   - Auth (авторизация пользователей и админов)
   - Users
   - Lessons
   - Words
   - Admin
   - Progress

## 🔍 Проверка

После запуска проверьте:

```bash
# Health check
curl http://localhost:3000/health

# Должен вернуть:
# {"status":"ok","timestamp":"..."}
```

## ⚠️ Важные замечания

1. **НЕ используйте `synchronize: true`** - всегда используйте миграции
2. **Не коммитьте `.env` файл** - он в `.gitignore`
3. **Используйте переменные окружения** для всех секретов
4. **CORS настроен правильно** - не используйте `origin: true`

