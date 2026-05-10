import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { CheckAnswerLevel1Dto } from './dto/check-answer-level1.dto';
import { CheckPronunciationLevel2Dto } from './dto/check-pronunciation-level2.dto';
import { CheckSpellingLevel3Dto } from './dto/check-spelling-level3.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Levels')
@Controller('lessons/:lessonId/levels')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get(':levelNumber/words')
  @ApiOperation({ summary: 'Получить все слова для уровня' })
  @ApiParam({ name: 'lessonId', description: 'ID урока' })
  @ApiParam({ name: 'levelNumber', description: 'Номер уровня (1, 2, или 3)' })
  @ApiResponse({ status: 200, description: 'Список слов для уровня' })
  async getWordsForLevel(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Param('levelNumber', ParseIntPipe) levelNumber: number,
    @Request() req,
  ) {
    return this.progressService.getWordsForLevel(
      req.user.userId,
      lessonId,
      levelNumber,
    );
  }

  @Get(':levelNumber/words/next')
  @ApiOperation({ summary: 'Получить следующее слово для уровня' })
  @ApiParam({ name: 'lessonId', description: 'ID урока' })
  @ApiParam({ name: 'levelNumber', description: 'Номер уровня (1, 2, или 3)' })
  @ApiResponse({ status: 200, description: 'Следующее слово' })
  async getNextWord(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Param('levelNumber', ParseIntPipe) levelNumber: number,
    @Request() req,
  ) {
    return this.progressService.getNextWord(
      req.user.userId,
      lessonId,
      levelNumber,
    );
  }

  @Get(':levelNumber/progress')
  @ApiOperation({ summary: 'Получить прогресс по уровню' })
  @ApiParam({ name: 'lessonId', description: 'ID урока' })
  @ApiParam({ name: 'levelNumber', description: 'Номер уровня (1, 2, или 3)' })
  @ApiResponse({ status: 200, description: 'Прогресс по уровню' })
  async getLevelProgress(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Param('levelNumber', ParseIntPipe) levelNumber: number,
    @Request() req,
  ) {
    return this.progressService.getLevelProgress(
      req.user.userId,
      lessonId,
      levelNumber,
    );
  }

  @Get(':levelNumber/words/all')
  @ApiOperation({ summary: 'Получить все слова уровня с прогрессом' })
  @ApiParam({ name: 'lessonId', description: 'ID урока' })
  @ApiParam({ name: 'levelNumber', description: 'Номер уровня (1, 2, или 3)' })
  @ApiResponse({ status: 200, description: 'Все слова с прогрессом' })
  async getAllWordsWithProgress(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Param('levelNumber', ParseIntPipe) levelNumber: number,
    @Request() req,
  ) {
    return this.progressService.getAllWordsWithProgress(
      req.user.userId,
      lessonId,
      levelNumber,
    );
  }

  @Post(':levelNumber/check-answer')
  @ApiOperation({ summary: 'Проверить ответ (Уровень 1: Тест)' })
  @ApiParam({ name: 'lessonId', description: 'ID урока' })
  @ApiParam({ name: 'levelNumber', description: 'Номер уровня (должен быть 1)' })
  @ApiResponse({ status: 200, description: 'Результат проверки' })
  async checkAnswerLevel1(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Param('levelNumber', ParseIntPipe) levelNumber: number,
    @Body() dto: CheckAnswerLevel1Dto,
    @Request() req,
  ) {
    if (levelNumber !== 1) {
      throw new Error('This endpoint is only for Level 1');
    }
    return this.progressService.checkAnswerLevel1(
      req.user.userId,
      lessonId,
      dto,
    );
  }

  @Post(':levelNumber/check-pronunciation')
  @ApiOperation({ summary: 'Проверить произношение (Уровень 2: Аудио)' })
  @ApiParam({ name: 'lessonId', description: 'ID урока' })
  @ApiParam({ name: 'levelNumber', description: 'Номер уровня (должен быть 2)' })
  @ApiResponse({ status: 200, description: 'Результат проверки произношения' })
  async checkPronunciationLevel2(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Param('levelNumber', ParseIntPipe) levelNumber: number,
    @Body() dto: CheckPronunciationLevel2Dto,
    @Request() req,
  ) {
    if (levelNumber !== 2) {
      throw new Error('This endpoint is only for Level 2');
    }
    return this.progressService.checkPronunciationLevel2(
      req.user.userId,
      lessonId,
      dto,
    );
  }

  @Post(':levelNumber/check-spelling')
  @ApiOperation({ summary: 'Проверить написание (Уровень 3: Написание)' })
  @ApiParam({ name: 'lessonId', description: 'ID урока' })
  @ApiParam({ name: 'levelNumber', description: 'Номер уровня (должен быть 3)' })
  @ApiResponse({ status: 200, description: 'Результат проверки написания' })
  async checkSpellingLevel3(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Param('levelNumber', ParseIntPipe) levelNumber: number,
    @Body() dto: CheckSpellingLevel3Dto,
    @Request() req,
  ) {
    if (levelNumber !== 3) {
      throw new Error('This endpoint is only for Level 3');
    }
    return this.progressService.checkSpellingLevel3(
      req.user.userId,
      lessonId,
      dto,
    );
  }
}

