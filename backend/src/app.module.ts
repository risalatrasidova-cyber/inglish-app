import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { WordsModule } from './modules/words/words.module';
import { ProgressModule } from './modules/progress/progress.module';
import { UsersModule } from './modules/users/users.module';

function buildTypeOrmRootConfig() {
  const entities = [__dirname + '/**/*.entity{.ts,.js}'];
  const migrations = [__dirname + '/../migrations/*{.ts,.js}'];
  const synchronize = false;
  const logging = process.env.NODE_ENV === 'development';

  if (process.env.DB_TYPE === 'sqlite') {
    return {
      type: 'sqlite' as const,
      database: join(process.cwd(), process.env.DB_DATABASE || 'inglish_app.db'),
      entities,
      migrations,
      synchronize,
      logging,
    };
  }

  // Render / Heroku / Railway: внешний Postgres через одну строку (иначе fallback host=localhost → ECONNREFUSED)
  if (process.env.DATABASE_URL) {
    const ssl =
      process.env.DATABASE_SSL === 'false'
        ? false
        : ({ rejectUnauthorized: false } as const);
    return {
      type: 'postgres' as const,
      url: process.env.DATABASE_URL,
      ssl,
      entities,
      migrations,
      synchronize,
      logging,
    };
  }

  return {
    type: 'postgres' as const,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '', 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'inglish_app',
    entities,
    migrations,
    synchronize,
    logging,
  };
}

@Module({
  imports: [
    TypeOrmModule.forRoot(buildTypeOrmRootConfig()),

    // Rate Limiting
    ThrottlerModule.forRoot({
      throttlers: [{
        ttl: 60000,
        limit: 100,
      }],
    }),

    // Модули приложения
    AuthModule,
    LessonsModule,
    WordsModule,
    ProgressModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

