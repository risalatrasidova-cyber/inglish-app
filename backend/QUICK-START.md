# 🚀 Быстрый запуск для просмотра

## Что можно посмотреть прямо сейчас:

### 1. Swagger документация API
После запуска приложения будет доступна по адресу:
- http://localhost:3000/api/docs

### 2. Health check
- http://localhost:3000/health
- http://localhost:3000/

---

## 📋 Шаги для запуска:

### Шаг 1: Установить зависимости

```bash
cd backend
npm install
```

### Шаг 2: Создать файл `.env`

Скопируйте `.env.example` в `.env`:

```bash
cp .env.example .env
```

Или создайте вручную файл `.env` со следующим содержимым:

```env
# Database (можно использовать SQLite для быстрого старта)
DB_TYPE=sqlite
DB_DATABASE=./inglish_app.db

# Или PostgreSQL (если установлен)
# DB_TYPE=postgres
# DB_HOST=localhost
# DB_PORT=5432
# DB_USERNAME=postgres
# DB_PASSWORD=postgres
# DB_DATABASE=inglish_app

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Admin JWT
ADMIN_JWT_SECRET=your-admin-secret-key-change-in-production
ADMIN_JWT_EXPIRES_IN=1h

# Server
PORT=3000
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:5173

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads/audio
```

### Шаг 3: Применить миграции

**Для SQLite:**
```bash
npm run migration:run
```

**Для PostgreSQL:**
1. Создайте базу данных:
```sql
CREATE DATABASE inglish_app;
```

2. Примените миграции:
```bash
npm run migration:run
```

### Шаг 4: Создать первого администратора

```bash
npm run create:admin admin admin123
```

### Шаг 5: Запустить приложение

```bash
npm run start:dev
```

Приложение запустится на http://localhost:3000

---

## 🔍 Что можно проверить:

### 1. Swagger документация
Откройте в браузере: http://localhost:3000/api/docs

Там вы увидите все доступные endpoints:
- Auth (авторизация пользователей и админов)
- Admin - Lessons (CRUD для уроков)
- Admin - Words (CRUD для слов)
- Audio (получение аудио файлов)

### 2. Тестирование через Swagger

1. **Войти как администратор:**
   - Endpoint: `POST /auth/admin/login`
   - Body: `{ "login": "admin", "password": "admin123" }`
   - Скопируйте полученный токен

2. **Авторизоваться в Swagger:**
   - Нажмите кнопку "Authorize" вверху Swagger UI
   - Вставьте токен в формате: `Bearer {ваш_токен}`
   - Теперь можно тестировать все endpoints админки

3. **Создать урок:**
   - Endpoint: `POST /admin/lessons`
   - Body: `{ "name": "Урок 1: Животные", "is_active": true }`

4. **Создать слово:**
   - Endpoint: `POST /admin/words`
   - Form-data:
     - `english_word`: "cat"
     - `russian_translation`: "кот"
     - `lesson_id`: 1
     - `audio_file`: [выберите MP3 файл]

### 3. Health check

```bash
curl http://localhost:3000/health
```

Должен вернуть:
```json
{"status":"ok","timestamp":"..."}
```

---

## ⚠️ Важно:

1. **База данных должна быть создана** перед применением миграций
2. **Для SQLite** база создается автоматически при применении миграций
3. **Для PostgreSQL** нужно создать БД вручную
4. **Папка `uploads/audio`** создается автоматически при первом запуске

---

## 🐛 Если что-то не работает:

1. Проверьте, что все зависимости установлены: `npm install`
2. Проверьте `.env` файл - все переменные должны быть заполнены
3. Проверьте, что база данных доступна
4. Проверьте логи в консоли при запуске

---

## 📝 Следующие шаги после запуска:

1. Создать несколько уроков через админку
2. Добавить слова к урокам
3. Протестировать API через Swagger
4. Начать разработку Frontend

