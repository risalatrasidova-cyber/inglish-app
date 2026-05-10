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

@Module({
  imports: [
    // База данных (путь к SQLite — всегда относительно папки backend)
    TypeOrmModule.forRoot({
      type: (process.env.DB_TYPE as any) || 'postgres',
      ...(process.env.DB_TYPE === 'sqlite'
        ? {
            database: join(process.cwd(), process.env.DB_DATABASE || 'inglish_app.db'),
          }
        : {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT) || 5432,
            username: process.env.DB_USERNAME || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            database: process.env.DB_DATABASE || 'inglish_app',
          }),
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/../migrations/*{.ts,.js}'],
      synchronize: false, // ВАЖНО: всегда false! Используем миграции
      logging: process.env.NODE_ENV === 'development',
    }),

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

