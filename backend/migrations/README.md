# Миграции базы данных

## Создание миграции

```bash
npm run migration:generate -- src/migrations/InitialMigration
```

## Применение миграций

```bash
npm run migration:run
```

## Откат миграции

```bash
npm run migration:revert
```

## Важно

- **НЕ используйте `synchronize: true`** в production
- Всегда создавайте миграции для изменения схемы БД
- Проверяйте миграции перед применением

