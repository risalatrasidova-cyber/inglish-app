import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Lesson } from './entities/lesson.entity';
import { Word } from '../words/entities/word.entity';
import { LevelProgress } from '../progress/entities/level-progress.entity';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { LessonQueryDto } from './dto/lesson-query.dto';
import { LessonListQueryDto } from './dto/lesson-list-query.dto';

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
    @InjectRepository(Word)
    private wordRepository: Repository<Word>,
    @InjectRepository(LevelProgress)
    private levelProgressRepository: Repository<LevelProgress>,
  ) {}

  async findAll(query: LessonQueryDto) {
    const { page = 1, limit = 20, search, sort = 'order' } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.lessonRepository
      .createQueryBuilder('lesson')
      .leftJoinAndSelect('lesson.words', 'words')
      .loadRelationCountAndMap('lesson.word_count', 'lesson.words');

    if (search) {
      queryBuilder.where('lesson.name LIKE :search', {
        search: `%${search}%`,
      });
    }

    // Сортировка
    switch (sort) {
      case 'name':
        queryBuilder.orderBy('lesson.name', 'ASC');
        break;
      case 'created_at':
        queryBuilder.orderBy('lesson.created_at', 'DESC');
        break;
      case 'order':
      default:
        queryBuilder.orderBy('lesson.order', 'ASC');
        break;
    }

    const [lessons, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      lessons: lessons.map((lesson) => ({
        id: lesson.id,
        name: lesson.name,
        description: lesson.description,
        order: lesson.order,
        is_active: lesson.is_active,
        word_count: (lesson as any).word_count || 0,
        created_at: lesson.created_at,
        updated_at: lesson.updated_at,
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
    const lesson = await this.lessonRepository.findOne({
      where: { id },
      relations: ['words'],
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    return {
      id: lesson.id,
      name: lesson.name,
      description: lesson.description,
      order: lesson.order,
      is_active: lesson.is_active,
      words: lesson.words.map((word) => ({
        id: word.id,
        english_word: word.english_word,
        russian_translation: word.russian_translation,
      })),
      created_at: lesson.created_at,
      updated_at: lesson.updated_at,
    };
  }

  async create(createLessonDto: CreateLessonDto) {
    const { word_ids, ...lessonData } = createLessonDto;

    // Проверка существования слов, если указаны
    if (word_ids && word_ids.length > 0) {
      const words = await this.wordRepository.find({
        where: { id: In(word_ids) },
      });

      if (words.length !== word_ids.length) {
        throw new BadRequestException('Some words not found');
      }
    }

    const lesson = this.lessonRepository.create(lessonData);
    const savedLesson = await this.lessonRepository.save(lesson);

    // Привязка слов к уроку
    if (word_ids && word_ids.length > 0) {
      await this.wordRepository.update(
        { id: In(word_ids) },
        { lesson_id: savedLesson.id },
      );
    }

    // Получаем обновленный урок с количеством слов
    const lessonWithWords = await this.lessonRepository.findOne({
      where: { id: savedLesson.id },
      relations: ['words'],
    });

    return {
      id: lessonWithWords.id,
      name: lessonWithWords.name,
      description: lessonWithWords.description,
      order: lessonWithWords.order,
      is_active: lessonWithWords.is_active,
      word_count: lessonWithWords.words.length,
      created_at: lessonWithWords.created_at,
      updated_at: lessonWithWords.updated_at,
    };
  }

  async update(id: number, updateLessonDto: UpdateLessonDto) {
    const lesson = await this.lessonRepository.findOne({
      where: { id },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    const { word_ids, ...lessonData } = updateLessonDto;

    // Обновление данных урока
    if (Object.keys(lessonData).length > 0) {
      Object.assign(lesson, lessonData);
      await this.lessonRepository.save(lesson);
    }

    // Обновление привязки слов
    if (word_ids !== undefined) {
      // Сначала отвязываем все слова от этого урока
      await this.wordRepository.update(
        { lesson_id: id },
        { lesson_id: null as any }, // Временно null, потом обновим
      );

      // Проверка существования новых слов
      if (word_ids.length > 0) {
        const words = await this.wordRepository.find({
          where: { id: In(word_ids) },
        });

        if (words.length !== word_ids.length) {
          throw new BadRequestException('Some words not found');
        }

        // Привязываем новые слова к уроку
        await this.wordRepository.update(
          { id: In(word_ids) },
          { lesson_id: id },
        );
      }
    }

    // Получаем обновленный урок
    return this.findOne(id);
  }

  async remove(id: number) {
    const lesson = await this.lessonRepository.findOne({
      where: { id },
      relations: ['words'],
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    // Проверка наличия связанных слов
    if (lesson.words && lesson.words.length > 0) {
      throw new BadRequestException(
        'Cannot delete lesson with associated words. Please remove words first.',
      );
    }

    await this.lessonRepository.remove(lesson);

    return { message: 'Lesson deleted successfully' };
  }

  // Методы для пользователей
  async findAllForUser(userId: number, query: LessonListQueryDto) {
    const lessons = await this.lessonRepository.find({
      where: { is_active: true },
      order: { order: 'ASC' },
      relations: ['words'],
    });

    const result = [];

    for (const lesson of lessons) {
      // Проверка доступности урока
      const isAvailable = await this.isLessonAvailable(userId, lesson.id);

      const lessonData: any = {
        id: lesson.id,
        name: lesson.name,
        description: lesson.description,
        order: lesson.order,
        is_active: lesson.is_active,
        word_count: lesson.words?.length || 0,
        is_available: isAvailable,
      };

      // Добавляем прогресс, если запрошен
      if (query.include_progress) {
        const progress = await this.getLessonProgress(userId, lesson.id);
        lessonData.progress = progress;
      }

      result.push(lessonData);
    }

    return result;
  }

  private async isLessonAvailable(userId: number, lessonId: number): Promise<boolean> {
    // Первый урок всегда доступен
    const firstLesson = await this.lessonRepository.findOne({
      where: { is_active: true },
      order: { order: 'ASC' },
    });

    if (firstLesson && firstLesson.id === lessonId) {
      return true;
    }

    // Для остальных уроков проверяем, пройдены ли 2 уровня в предыдущем уроке
    const currentLesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
    });

    if (!currentLesson) return false;

    // Находим предыдущий урок
    const previousLesson = await this.lessonRepository.findOne({
      where: { is_active: true, order: currentLesson.order - 1 },
    });

    if (!previousLesson) return false;

    // Проверяем, пройдены ли минимум 2 уровня в предыдущем уроке
    const completedLevels = await this.levelProgressRepository.count({
      where: {
        user_id: userId,
        lesson_id: previousLesson.id,
        is_completed: true,
      },
    });

    return completedLevels >= 2;
  }

  private async getLessonProgress(userId: number, lessonId: number) {
    const levels = [1, 2, 3];
    const progress = [];

    for (const levelNumber of levels) {
      const levelProgress = await this.levelProgressRepository.findOne({
        where: {
          user_id: userId,
          lesson_id: lessonId,
          level_number: levelNumber,
        },
      });

      progress.push({
        level_number: levelNumber,
        best_percentage: levelProgress?.best_percentage || 0,
        is_completed: levelProgress?.is_completed || false,
        has_gold_star: levelProgress?.has_gold_star || false,
        has_diamond_star: levelProgress?.has_diamond_star || false,
      });
    }

    return {
      level_1_completed: progress[0].is_completed,
      level_2_completed: progress[1].is_completed,
      level_3_completed: progress[2].is_completed,
      stars: {
        level_1: progress[0].has_diamond_star ? 'diamond' : progress[0].has_gold_star ? 'gold' : null,
        level_2: progress[1].has_diamond_star ? 'diamond' : progress[1].has_gold_star ? 'gold' : null,
        level_3: progress[2].has_diamond_star ? 'diamond' : progress[2].has_gold_star ? 'gold' : null,
      },
    };
  }
}

