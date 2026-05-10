import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
import { Word } from '../words/entities/word.entity';
import { LevelProgress } from './entities/level-progress.entity';
import { WordProgress } from './entities/word-progress.entity';
import { Reward, RewardType } from './entities/reward.entity';
import { User } from '../users/entities/user.entity';
import { CheckAnswerLevel1Dto } from './dto/check-answer-level1.dto';
import { CheckPronunciationLevel2Dto } from './dto/check-pronunciation-level2.dto';
import { CheckSpellingLevel3Dto } from './dto/check-spelling-level3.dto';
import { CheckResponseDto } from './dto/check-response.dto';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(Word)
    private wordRepository: Repository<Word>,
    @InjectRepository(LevelProgress)
    private levelProgressRepository: Repository<LevelProgress>,
    @InjectRepository(WordProgress)
    private wordProgressRepository: Repository<WordProgress>,
    @InjectRepository(Reward)
    private rewardRepository: Repository<Reward>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // Получить слова для уровня (с алгоритмом приоритетов)
  async getWordsForLevel(
    userId: number,
    lessonId: number,
    levelNumber: number,
  ) {
    // Проверка существования урока
    const words = await this.wordRepository.find({
      where: { lesson_id: lessonId },
    });

    if (words.length === 0) {
      throw new NotFoundException('No words found for this lesson');
    }

    // Получаем прогресс пользователя по словам в этом уровне
    const wordProgresses = await this.wordProgressRepository.find({
      where: {
        user_id: userId,
        lesson_id: lessonId,
        level_number: levelNumber,
      },
    });

    const progressMap = new Map(
      wordProgresses.map((wp) => [wp.word_id, wp]),
    );

    // Разделяем слова по приоритетам
    const newWords: Word[] = []; // Приоритет 1: никогда не были пройдены правильно
    const incorrectWords: Word[] = []; // Приоритет 2: были неправильные ответы
    const passedWords: Word[] = []; // Приоритет 3: уже пройдены

    for (const word of words) {
      const progress = progressMap.get(word.id);
      if (!progress || !progress.is_passed) {
        // Проверяем, были ли неправильные попытки
        if (progress && progress.correct_count === 0) {
          incorrectWords.push(word);
        } else {
          newWords.push(word);
        }
      } else {
        passedWords.push(word);
      }
    }

    // Перемешиваем массивы для случайности
    const shuffle = <T>(array: T[]): T[] => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    // Объединяем в порядке приоритетов
    const prioritizedWords = [
      ...shuffle(newWords),
      ...shuffle(incorrectWords),
      ...shuffle(passedWords),
    ];

    return {
      words: prioritizedWords.map((word) => ({
        id: word.id,
        english_word: word.english_word,
        russian_translation: word.russian_translation,
        audio_file_path: word.audio_file_path,
        is_passed: progressMap.get(word.id)?.is_passed || false,
      })),
      total_words: words.length,
      passed_words: wordProgresses.filter((wp) => wp.is_passed).length,
    };
  }

  // Получить следующее слово для уровня
  async getNextWord(
    userId: number,
    lessonId: number,
    levelNumber: number,
  ) {
    const wordsData = await this.getWordsForLevel(
      userId,
      lessonId,
      levelNumber,
    );

    if (wordsData.words.length === 0) {
      throw new NotFoundException('No words available');
    }

    const word = wordsData.words[0];

    // Для уровня 1 генерируем варианты ответов
    if (levelNumber === 1) {
      const allWords = await this.wordRepository.find({
        where: { lesson_id: lessonId },
      });

      // Сначала решаем, на каком языке показывается слово — варианты ответа на другом языке
      const showInEnglish = Math.random() > 0.5;

      // 5 случайных других слов из урока (для отвлекающих вариантов)
      const otherWords = allWords
        .filter((w) => w.id !== word.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 5);

      const answerOptions = showInEnglish
        ? [word.russian_translation, ...otherWords.map((w) => w.russian_translation)]
        : [word.english_word, ...otherWords.map((w) => w.english_word)];

      const shuffled = answerOptions.sort(() => Math.random() - 0.5);

      return {
        word: {
          id: word.id,
          english_word: word.english_word,
          russian_translation: word.russian_translation,
          audio_file_path: word.audio_file_path,
        },
        show_in_english: showInEnglish,
        answer_options: shuffled,
      };
    }

    // Для уровней 2 и 3 просто возвращаем слово
    return {
      word: {
        id: word.id,
        english_word: word.english_word,
        russian_translation: word.russian_translation,
        audio_file_path: word.audio_file_path,
      },
    };
  }

  // Проверка ответа для Уровня 1 (Тест)
  async checkAnswerLevel1(
    userId: number,
    lessonId: number,
    dto: CheckAnswerLevel1Dto,
  ): Promise<CheckResponseDto> {
    const word = await this.wordRepository.findOne({
      where: { id: dto.word_id, lesson_id: lessonId },
    });

    if (!word) {
      throw new NotFoundException('Word not found');
    }

    const selected = dto.selected_answer.toLowerCase().trim();
    const isCorrect = dto.show_in_english
      ? selected === word.russian_translation.toLowerCase().trim()
      : selected === word.english_word.toLowerCase().trim();

    return this.processAnswer(
      userId,
      lessonId,
      1,
      word.id,
      isCorrect,
      word.audio_file_path,
    );
  }

  // Проверка произношения для Уровня 2 (Аудио)
  async checkPronunciationLevel2(
    userId: number,
    lessonId: number,
    dto: CheckPronunciationLevel2Dto,
  ): Promise<CheckResponseDto> {
    const word = await this.wordRepository.findOne({
      where: { id: dto.word_id, lesson_id: lessonId },
    });

    if (!word) {
      throw new NotFoundException('Word not found');
    }

    const spokenRaw = dto.spoken_text.toLowerCase().trim();
    const expectedRaw = word.english_word.toLowerCase().trim();

    const { isCorrect, similarity } = this.matchPronunciation(spokenRaw, expectedRaw);

    const response = await this.processAnswer(
      userId,
      lessonId,
      2,
      word.id,
      isCorrect,
      word.audio_file_path,
    );

    response.similarity = similarity;
    if (!isCorrect) {
      response.correct_answer = word.english_word;
    }

    return response;
  }

  // Проверка написания для Уровня 3 (Написание)
  async checkSpellingLevel3(
    userId: number,
    lessonId: number,
    dto: CheckSpellingLevel3Dto,
  ): Promise<CheckResponseDto> {
    const word = await this.wordRepository.findOne({
      where: { id: dto.word_id, lesson_id: lessonId },
    });

    if (!word) {
      throw new NotFoundException('Word not found');
    }

    // Точное совпадение без учета регистра
    const isCorrect =
      dto.typed_text.toLowerCase().trim() ===
      word.english_word.toLowerCase().trim();

    const response = await this.processAnswer(
      userId,
      lessonId,
      3,
      word.id,
      isCorrect,
      word.audio_file_path,
    );

    if (!isCorrect) {
      response.correct_answer = word.english_word;
    }

    return response;
  }

  // Общая обработка ответа
  private async processAnswer(
    userId: number,
    lessonId: number,
    levelNumber: number,
    wordId: number,
    isCorrect: boolean,
    audioFilePath: string,
  ): Promise<CheckResponseDto> {
    const word = await this.wordRepository.findOne({
      where: { id: wordId },
    });

    // Получаем или создаем прогресс по уровню
    let levelProgress = await this.levelProgressRepository.findOne({
      where: {
        user_id: userId,
        lesson_id: lessonId,
        level_number: levelNumber,
      },
    });

    if (!levelProgress) {
      levelProgress = this.levelProgressRepository.create({
        user_id: userId,
        lesson_id: lessonId,
        level_number: levelNumber,
        first_started_at: new Date(),
        total_attempts: 0,
        total_correct_answers: 0,
        best_percentage: 0,
      });
    }

    // create() без загрузки из БД не подставляет default из колонок — иначе += 1 даёт NaN
    levelProgress.total_attempts = (levelProgress.total_attempts ?? 0) + 1;
    levelProgress.total_correct_answers = levelProgress.total_correct_answers ?? 0;
    levelProgress.best_percentage = Number(levelProgress.best_percentage ?? 0);
    levelProgress.last_played_at = new Date();

    // Получаем или создаем прогресс по слову
    let wordProgress = await this.wordProgressRepository.findOne({
      where: {
        user_id: userId,
        word_id: wordId,
        level_number: levelNumber,
      },
    });

    if (!wordProgress) {
      wordProgress = this.wordProgressRepository.create({
        user_id: userId,
        word_id: wordId,
        lesson_id: lessonId,
        level_number: levelNumber,
        correct_count: 0,
        is_passed: false,
      });
    }
    wordProgress.correct_count = wordProgress.correct_count ?? 0;

    const response: CheckResponseDto = {
      is_correct: isCorrect,
      audio_file_path: audioFilePath,
      progress: {
        correct_count: levelProgress.total_correct_answers,
        total_words: 0,
        percentage: 0,
      },
    };

    if (isCorrect) {
      // Обновляем прогресс по слову
      if (!wordProgress.is_passed) {
        wordProgress.is_passed = true;
        wordProgress.first_correct_at = new Date();
      }
      wordProgress.correct_count += 1;
      wordProgress.last_correct_at = new Date();

      // Обновляем прогресс по уровню
      levelProgress.total_correct_answers += 1;

      // Получаем общее количество слов в уроке
      const totalWords = await this.wordRepository.count({
        where: { lesson_id: lessonId },
      });

      const percentage =
        (levelProgress.total_correct_answers / totalWords) * 100;

      if (percentage > (levelProgress.best_percentage ?? 0)) {
        levelProgress.best_percentage = percentage;
      }

      // Проверяем достижения
      levelProgress.is_completed = percentage >= 70;

      // Бонус за слово: один раз на слово+уровень (см. таблицу rewards), не по «первому correct_count === 1»
      // после reset:money прогресс слов мог остаться — иначе деньги не начислялись бы повторно
      const rewardAmount =
        levelNumber === 1 ? 5 : levelNumber === 2 ? 10 : 15;
      const gaveWordReward = await this.giveReward(
        userId,
        lessonId,
        levelNumber,
        RewardType.WORD,
        rewardAmount,
        wordId,
      );

      if (gaveWordReward) {
        response.is_new_word = true;
        response.reward = {
          amount: rewardAmount,
          message: `+${rewardAmount}₽`,
        };
      } else {
        response.message = 'Верно!';
      }

      // Сохраняем прогресс
      await this.levelProgressRepository.save(levelProgress);
      await this.wordProgressRepository.save(wordProgress);

      // Проверяем звезды (после сохранения прогресса)
      if (percentage >= 90 && !levelProgress.has_gold_star) {
        levelProgress.has_gold_star = true;
        await this.levelProgressRepository.save(levelProgress);
        await this.giveReward(
          userId,
          lessonId,
          levelNumber,
          RewardType.LEVEL_90,
          100,
        );
      }

      if (percentage >= 100 && !levelProgress.has_diamond_star) {
        levelProgress.has_diamond_star = true;
        await this.levelProgressRepository.save(levelProgress);
        await this.giveReward(
          userId,
          lessonId,
          levelNumber,
          RewardType.LEVEL_100,
          150,
        );
      }

      response.progress = {
        correct_count: levelProgress.total_correct_answers,
        total_words: totalWords,
        percentage: Math.round(percentage * 100) / 100,
      };
    } else {
      response.message = 'Попробуй еще раз';
      const totalWords = await this.wordRepository.count({
        where: { lesson_id: lessonId },
      });
      const percentage =
        totalWords > 0
          ? (levelProgress.total_correct_answers / totalWords) * 100
          : 0;

      response.progress = {
        correct_count: levelProgress.total_correct_answers,
        total_words: totalWords,
        percentage: Math.round(percentage * 100) / 100,
      };

      await this.levelProgressRepository.save(levelProgress);
      await this.wordProgressRepository.save(wordProgress);
    }

    return response;
  }

  // Выдача вознаграждения (с защитой от дублирования)
  private async giveReward(
    userId: number,
    lessonId: number,
    levelNumber: number,
    rewardType: RewardType,
    amount: number,
    wordId?: number,
  ): Promise<boolean> {
    // Проверяем, не получено ли уже это вознаграждение
    const existingReward = await this.rewardRepository.findOne({
      where: {
        user_id: userId,
        reward_type: rewardType,
        lesson_id: rewardType === RewardType.WORD ? lessonId : lessonId,
        word_id: rewardType === RewardType.WORD ? wordId : null,
        level_number: levelNumber,
      },
    });

    if (existingReward) {
      return false;
    }

    // Создаем запись о вознаграждении
    const reward = this.rewardRepository.create({
      user_id: userId,
      reward_type: rewardType,
      lesson_id: lessonId,
      word_id: rewardType === RewardType.WORD ? wordId : null,
      level_number: levelNumber,
      amount,
    });

    await this.rewardRepository.save(reward);

    // Обновляем общий счетчик денег пользователя
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (user) {
      user.total_money += amount;
      await this.userRepository.save(user);
    }

    return true;
  }

  /**
   * Уровень 2: учитываем пунктуацию, лишние слова («the cat» при эталоне «cat»),
   * затем нечёткое совпадение (порог чуть ниже 80%, т.к. короткие слова часто падали).
   */
  private matchPronunciation(
    spoken: string,
    expected: string,
  ): { isCorrect: boolean; similarity: number } {
    const stripEdge = (s: string) =>
      s.replace(/^[\s.,!?;:'"«»]+|[\s.,!?;:'"«»]+$/g, '').trim();

    const letters = (s: string) => s.replace(/[^a-z0-9'-]/gi, '');

    const s0 = stripEdge(spoken);
    const e0 = stripEdge(expected);

    const sLetters = letters(s0);
    const eLetters = letters(e0);

    if (eLetters.length > 0 && sLetters === eLetters) {
      return { isCorrect: true, similarity: 100 };
    }

    const tokens = s0
      .split(/\s+/)
      .map((t) => letters(t))
      .filter((t) => t.length > 0);

    if (eLetters.length > 0 && tokens.includes(eLetters)) {
      return { isCorrect: true, similarity: 100 };
    }

    let best = 0;
    for (const t of tokens) {
      best = Math.max(best, this.calculateSimilarity(t, eLetters));
    }
    best = Math.max(best, this.calculateSimilarity(sLetters, eLetters));

    const pct = Math.round(best * 10000) / 100;

    return {
      isCorrect: best >= 0.72,
      similarity: pct,
    };
  }

  // Расчет схожести строк (Levenshtein distance)
  private calculateSimilarity(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;

    if (len1 === 0) return len2 === 0 ? 1 : 0;
    if (len2 === 0) return 0;

    const matrix: number[][] = [];

    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost,
        );
      }
    }

    const distance = matrix[len1][len2];
    const maxLength = Math.max(len1, len2);
    return 1 - distance / maxLength;
  }

  // Получить прогресс по уровню
  async getLevelProgress(
    userId: number,
    lessonId: number,
    levelNumber: number,
  ) {
    const levelProgress = await this.levelProgressRepository.findOne({
      where: {
        user_id: userId,
        lesson_id: lessonId,
        level_number: levelNumber,
      },
    });

    const totalWords = await this.wordRepository.count({
      where: { lesson_id: lessonId },
    });

    const passedWords = await this.wordProgressRepository.count({
      where: {
        user_id: userId,
        lesson_id: lessonId,
        level_number: levelNumber,
        is_passed: true,
      },
    });

    if (!levelProgress) {
      return {
        lesson_id: lessonId,
        level_number: levelNumber,
        best_percentage: 0,
        total_correct_answers: 0,
        total_attempts: 0,
        is_completed: false,
        has_gold_star: false,
        has_diamond_star: false,
        current_percentage: 0,
        total_words: totalWords,
        passed_words: passedWords,
      };
    }

    const currentPercentage =
      totalWords > 0 ? (levelProgress.total_correct_answers / totalWords) * 100 : 0;

    return {
      lesson_id: lessonId,
      level_number: levelNumber,
      best_percentage: parseFloat(levelProgress.best_percentage.toFixed(2)),
      total_correct_answers: levelProgress.total_correct_answers,
      total_attempts: levelProgress.total_attempts,
      is_completed: levelProgress.is_completed,
      has_gold_star: levelProgress.has_gold_star,
      has_diamond_star: levelProgress.has_diamond_star,
      current_percentage: Math.round(currentPercentage * 100) / 100,
      total_words: totalWords,
      passed_words: passedWords,
    };
  }

  // Получить все слова уровня с прогрессом
  async getAllWordsWithProgress(
    userId: number,
    lessonId: number,
    levelNumber: number,
  ) {
    const words = await this.wordRepository.find({
      where: { lesson_id: lessonId },
      order: { id: 'ASC' },
    });

    const wordProgresses = await this.wordProgressRepository.find({
      where: {
        user_id: userId,
        lesson_id: lessonId,
        level_number: levelNumber,
      },
    });

    const progressMap = new Map(
      wordProgresses.map((wp) => [wp.word_id, wp]),
    );

    return {
      words: words.map((word) => {
        const progress = progressMap.get(word.id);
        return {
          id: word.id,
          english_word: word.english_word,
          russian_translation: word.russian_translation,
          audio_file_path: word.audio_file_path,
          is_passed: progress?.is_passed || false,
          correct_count: progress?.correct_count || 0,
        };
      }),
    };
  }
}

