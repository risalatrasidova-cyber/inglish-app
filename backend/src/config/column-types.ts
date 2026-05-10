import 'dotenv/config';

/**
 * Дата/время: SQLite — `datetime`, PostgreSQL — `timestamp` (Render и т.д.).
 */
export function dateTimeColumnType(): 'datetime' | 'timestamp' {
  return process.env.DB_TYPE === 'sqlite' ? 'datetime' : 'timestamp';
}
