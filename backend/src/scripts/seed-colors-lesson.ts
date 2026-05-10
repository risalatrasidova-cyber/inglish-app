/**
 * Добавляет урок «Цвета» и слова red/blue/… в SQLite.
 * Аудио: общий плейсхолдер (первый найденный mp3 в uploads/audio) — замени в админке на свои файлы.
 *
 * Запуск из папки backend: npx ts-node src/scripts/seed-colors-lesson.ts
 */
import { AppDataSource } from '../config/data-source';
import { Lesson } from '../modules/lessons/entities/lesson.entity';
import { Word } from '../modules/words/entities/word.entity';
import * as fs from 'fs';
import * as path from 'path';

const PAIRS: [string, string][] = [
  ['red', 'красный'],
  ['blue', 'синий'],
  ['green', 'зелёный'],
  ['yellow', 'жёлтый'],
  ['black', 'чёрный'],
  ['white', 'белый'],
];

async function main() {
  await AppDataSource.initialize();
  const lessonRepo = AppDataSource.getRepository(Lesson);
  const wordRepo = AppDataSource.getRepository(Word);

  const maxOrder = await lessonRepo.maximum('order');
  const nextOrder = typeof maxOrder === 'number' ? maxOrder + 1 : 1;

  const existing = await lessonRepo.findOne({ where: { name: 'Цвета' } });
  if (existing) {
    console.log('Урок «Цвета» уже есть (id=%s). Выход.', existing.id);
    await AppDataSource.destroy();
    return;
  }

  const uploadDir = path.join(process.cwd(), 'uploads', 'audio');
  const files = fs.existsSync(uploadDir) ? fs.readdirSync(uploadDir).filter((f) => f.endsWith('.mp3')) : [];
  if (files.length === 0) {
    console.error('Нет ни одного .mp3 в uploads/audio — добавь файл или загрузи слово через админку.');
    process.exit(1);
  }
  const placeholderPath = `/uploads/audio/${files[0]}`;

  const lesson = lessonRepo.create({
    name: 'Цвета',
    description: 'Colors — базовые цвета',
    order: nextOrder,
    is_active: true,
  });
  await lessonRepo.save(lesson);

  for (const [en, ru] of PAIRS) {
    const w = wordRepo.create({
      english_word: en,
      russian_translation: ru,
      lesson_id: lesson.id,
      audio_file_path: placeholderPath,
      audio_file_name: `${en}.mp3`,
    });
    await wordRepo.save(w);
  }

  console.log(`Готово: урок «Цвета» id=${lesson.id}, слов: ${PAIRS.length}. Плейсхолдер аудио: ${placeholderPath}`);
  await AppDataSource.destroy();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
