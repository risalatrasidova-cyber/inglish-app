import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like } from 'typeorm';
import { Word } from './entities/word.entity';
import { Lesson } from '../lessons/entities/lesson.entity';
import { CreateWordDto } from './dto/create-word.dto';
import { UpdateWordDto } from './dto/update-word.dto';
import { WordQueryDto } from './dto/word-query.dto';
import { BatchDeleteWordsDto } from './dto/batch-delete.dto';
import { BatchMoveWordsDto } from './dto/batch-move.dto';

@Injectable()
export class WordsService {
  constructor(
    @InjectRepository(Word)
    private wordRepository: Repository<Word>,
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
  ) {}

  async findAll(query: WordQueryDto) {
    const { page = 1, limit = 20, lesson_id, search, sort = 'created_at' } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.wordRepository
      .createQueryBuilder('word')
      .leftJoinAndSelect('word.lesson', 'lesson');

    if (lesson_id) {
      queryBuilder.where('word.lesson_id = :lesson_id', { lesson_id });
    }

    if (search) {
      queryBuilder.andWhere(
        '(word.english_word LIKE :search OR word.russian_translation LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Сортировка
    switch (sort) {
      case 'english_word':
        queryBuilder.orderBy('word.english_word', 'ASC');
        break;
      case 'russian_translation':
        queryBuilder.orderBy('word.russian_translation', 'ASC');
        break;
      case 'created_at':
      default:
        queryBuilder.orderBy('word.created_at', 'DESC');
        break;
    }

    const [words, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      words: words.map((word) => ({
        id: word.id,
        english_word: word.english_word,
        russian_translation: word.russian_translation,
        lesson_id: word.lesson_id,
        lesson_name: word.lesson?.name,
        audio_file_path: word.audio_file_path,
        audio_file_name: word.audio_file_name,
        created_at: word.created_at,
        updated_at: word.updated_at,
      })),
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const word = await this.wordRepository.findOne({
      where: { id },
      relations: ['lesson'],
    });

    if (!word) {
      throw new NotFoundException(`Word with ID ${id} not found`);
    }

    return {
      id: word.id,
      english_word: word.english_word,
      russian_translation: word.russian_translation,
      lesson_id: word.lesson_id,
      lesson_name: word.lesson?.name,
      audio_file_path: word.audio_file_path,
      audio_file_name: word.audio_file_name,
      created_at: word.created_at,
      updated_at: word.updated_at,
    };
  }

  async create(
    createWordDto: CreateWordDto,
    audioFile: Express.Multer.File,
  ) {
    // Проверка существования урока
    const lesson = await this.lessonRepository.findOne({
      where: { id: createWordDto.lesson_id },
    });

    if (!lesson) {
      throw new NotFoundException(
        `Lesson with ID ${createWordDto.lesson_id} not found`,
      );
    }

    // Проверка аудио файла
    if (!audioFile) {
      throw new BadRequestException('Audio file is required');
    }

    // Валидация формата файла
    if (!audioFile.mimetype.includes('audio/mpeg') && !audioFile.mimetype.includes('audio/mp3')) {
      throw new BadRequestException(
        'Invalid audio file format. Only MP3 is allowed',
      );
    }

    // Валидация размера файла (5 МБ = 5242880 байт)
    const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 5242880;
    if (audioFile.size > maxSize) {
      throw new BadRequestException(
        `File too large. Maximum size is ${maxSize / 1024 / 1024}MB`,
      );
    }

    // Файл уже сохранен через FileInterceptor
    // Используем относительный путь для доступа через API
    const relativePath = audioFile.path.replace(/\\/g, '/').replace(process.cwd(), '');
    const filePath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;

    const word = this.wordRepository.create({
      ...createWordDto,
      audio_file_path: filePath,
      audio_file_name: audioFile.originalname,
    });

    const savedWord = await this.wordRepository.save(word);

    return {
      id: savedWord.id,
      english_word: savedWord.english_word,
      russian_translation: savedWord.russian_translation,
      lesson_id: savedWord.lesson_id,
      audio_file_path: savedWord.audio_file_path,
      audio_file_name: savedWord.audio_file_name,
      created_at: savedWord.created_at,
      updated_at: savedWord.updated_at,
    };
  }

  async update(
    id: number,
    updateWordDto: UpdateWordDto,
    audioFile?: Express.Multer.File,
  ) {
    const word = await this.wordRepository.findOne({
      where: { id },
    });

    if (!word) {
      throw new NotFoundException(`Word with ID ${id} not found`);
    }

    // Проверка урока, если указан
    if (updateWordDto.lesson_id) {
      const lesson = await this.lessonRepository.findOne({
        where: { id: updateWordDto.lesson_id },
      });

      if (!lesson) {
        throw new NotFoundException(
          `Lesson with ID ${updateWordDto.lesson_id} not found`,
        );
      }
    }

    // Обработка нового аудио файла
    if (audioFile) {
      // Валидация формата
      if (!audioFile.mimetype.includes('audio/mpeg') && !audioFile.mimetype.includes('audio/mp3')) {
        throw new BadRequestException(
          'Invalid audio file format. Only MP3 is allowed',
        );
      }

      // Валидация размера
      const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 5242880;
      if (audioFile.size > maxSize) {
        throw new BadRequestException(
          `File too large. Maximum size is ${maxSize / 1024 / 1024}MB`,
        );
      }

      // Файл уже сохранен через FileInterceptor
      // Удаляем старый файл, если он существует
      if (word.audio_file_path) {
        const fs = require('fs');
        const path = require('path');
        const oldFilePath = path.join(process.cwd(), word.audio_file_path);
        try {
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        } catch (error) {
          // Игнорируем ошибки удаления старого файла
        }
      }

      // Используем относительный путь для доступа через API
      const relativePath = audioFile.path.replace(/\\/g, '/').replace(process.cwd(), '');
      word.audio_file_path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
      word.audio_file_name = audioFile.originalname;
    }

    // Обновление остальных полей
    if (updateWordDto.english_word) {
      word.english_word = updateWordDto.english_word;
    }
    if (updateWordDto.russian_translation) {
      word.russian_translation = updateWordDto.russian_translation;
    }
    if (updateWordDto.lesson_id) {
      word.lesson_id = updateWordDto.lesson_id;
    }

    const updatedWord = await this.wordRepository.save(word);

    return this.findOne(updatedWord.id);
  }

  async remove(id: number) {
    const word = await this.wordRepository.findOne({
      where: { id },
    });

    if (!word) {
      throw new NotFoundException(`Word with ID ${id} not found`);
    }

    // Удаление аудио файла с диска
    if (word.audio_file_path) {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(process.cwd(), word.audio_file_path);
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        // Игнорируем ошибки удаления файла
      }
    }

    await this.wordRepository.remove(word);

    return { message: 'Word deleted successfully' };
  }

  async batchDelete(batchDeleteDto: BatchDeleteWordsDto) {
    const { word_ids } = batchDeleteDto;

    // Проверка существования всех слов
    const words = await this.wordRepository.find({
      where: { id: In(word_ids) },
    });

    if (words.length !== word_ids.length) {
      throw new BadRequestException('Some words not found');
    }

    // Удаление аудио файлов с диска
    const fs = require('fs');
    const path = require('path');
    for (const word of words) {
      if (word.audio_file_path) {
        const filePath = path.join(process.cwd(), word.audio_file_path);
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (error) {
          // Игнорируем ошибки удаления файла
        }
      }
    }

    await this.wordRepository.delete({ id: In(word_ids) });

    return { deleted_count: word_ids.length };
  }

  async batchMove(batchMoveDto: BatchMoveWordsDto) {
    const { word_ids, lesson_id } = batchMoveDto;

    // Проверка существования урока
    const lesson = await this.lessonRepository.findOne({
      where: { id: lesson_id },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lesson_id} not found`);
    }

    // Проверка существования всех слов
    const words = await this.wordRepository.find({
      where: { id: In(word_ids) },
    });

    if (words.length !== word_ids.length) {
      throw new BadRequestException('Some words not found');
    }

    // Перемещение слов в новый урок
    await this.wordRepository.update(
      { id: In(word_ids) },
      { lesson_id },
    );

    return { moved_count: word_ids.length };
  }
}

