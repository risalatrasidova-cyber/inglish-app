# Auth Module

Модуль авторизации для пользователей и администраторов.

## Endpoints

### Пользователи

- `POST /auth/user/login` - Вход пользователя (только логин)
- `POST /auth/user/register` - Регистрация нового пользователя
- `GET /auth/user/me` - Получить текущего пользователя (требует JWT токен)

### Администраторы

- `POST /auth/admin/login` - Вход администратора (логин + пароль)
- `GET /auth/admin/me` - Получить текущего администратора (требует JWT токен админа)

## Особенности

- **Пользователи:** Вход только по логину (без пароля). Если пользователя нет - создается автоматически.
- **Администраторы:** Вход по логину + паролю. Пароль хешируется через bcrypt.
- **JWT токены:** Разные секреты для пользователей и администраторов.
- **Guards:** Отдельные guards для пользователей (`JwtAuthGuard`) и администраторов (`JwtAdminGuard`).

## Использование

### Защита роутов пользователей:

```typescript
@UseGuards(JwtAuthGuard)
@Get('protected')
async protectedRoute(@Request() req) {
  // req.user содержит { userId, login }
}
```

### Защита роутов администраторов:

```typescript
@UseGuards(JwtAdminGuard)
@Get('admin/protected')
async adminProtectedRoute(@Request() req) {
  // req.user содержит { adminId, login }
}
```

