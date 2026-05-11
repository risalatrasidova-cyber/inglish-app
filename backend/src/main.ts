import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

function normalizeOrigin(url: string): string {
  return url.trim().replace(/\/$/, '');
}

/** CORS: `FRONTEND_URL` — одна строка или несколько origin через запятую. */
function allowedCorsOrigins(): string[] {
  const raw = (process.env.FRONTEND_URL ?? '').trim();
  if (!raw) return [normalizeOrigin('http://localhost:5173')];
  return raw.split(',').map((s) => normalizeOrigin(s)).filter(Boolean);
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Статическая раздача файлов (аудио)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  const corsAllowed = allowedCorsOrigins();
  console.log(`CORS allowed origins (${corsAllowed.length}): ${corsAllowed.join(' | ')}`);

  // CORS: callback надёжнее, чем строка|string[] (особенно с credentials + preflight)
  app.enableCors({
    origin: (requestOrigin: string | undefined, callback) => {
      if (!requestOrigin) {
        callback(null, true);
        return;
      }
      const o = normalizeOrigin(requestOrigin);
      if (corsAllowed.includes(o)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Глобальная обработка ошибок
  app.useGlobalFilters(new HttpExceptionFilter());

  // Глобальная валидация
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger документация
  const config = new DocumentBuilder()
    .setTitle('Inglish App API')
    .setDescription('API для приложения изучения английского языка')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api/docs`);
  if (process.env.DB_TYPE === 'sqlite') {
    console.log(`Database (SQLite): ${join(process.cwd(), process.env.DB_DATABASE || 'inglish_app.db')}`);
  }
}

bootstrap();

