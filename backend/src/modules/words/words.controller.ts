import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { WordsService } from './words.service';
import { CreateWordDto } from './dto/create-word.dto';
import { UpdateWordDto } from './dto/update-word.dto';
import { WordQueryDto } from './dto/word-query.dto';
import { BatchDeleteWordsDto } from './dto/batch-delete.dto';
import { BatchMoveWordsDto } from './dto/batch-move.dto';
import { WordResponseDto } from './dto/word-response.dto';
import { JwtAdminGuard } from '../../common/guards/jwt-admin.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import * as path from 'path';

// Конфигурация для загрузки файлов
const storage = diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads/audio';
    // Создаем папку, если её нет
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    cb(null, `word_${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  if (file.mimetype.includes('audio/mpeg') || file.mimetype.includes('audio/mp3')) {
    cb(null, true);
  } else {
    cb(new Error('Only MP3 files are allowed'), false);
  }
};

@ApiTags('Admin - Words')
@Controller('admin/words')
@UseGuards(JwtAdminGuard)
@ApiBearerAuth()
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('audio_file', {
      storage,
      fileFilter,
      limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5 МБ
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Создать слово' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        english_word: { type: 'string' },
        russian_translation: { type: 'string' },
        lesson_id: { type: 'number' },
        audio_file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Слово создано',
    type: WordResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Ошибка валидации' })
  create(
    @Body() createWordDto: CreateWordDto,
    @UploadedFile() audioFile: Express.Multer.File,
  ) {
    return this.wordsService.create(createWordDto, audioFile);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список всех слов' })
  @ApiResponse({ status: 200, description: 'Список слов' })
  findAll(@Query() query: WordQueryDto) {
    return this.wordsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить детали слова' })
  @ApiResponse({
    status: 200,
    description: 'Детали слова',
    type: WordResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Слово не найдено' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.wordsService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('audio_file', {
      storage,
      fileFilter,
      limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880,
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Обновить слово' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        english_word: { type: 'string' },
        russian_translation: { type: 'string' },
        lesson_id: { type: 'number' },
        audio_file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Слово обновлено',
    type: WordResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Слово не найдено' })
  @ApiResponse({ status: 400, description: 'Ошибка валидации' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWordDto: UpdateWordDto,
    @UploadedFile() audioFile?: Express.Multer.File,
  ) {
    return this.wordsService.update(id, updateWordDto, audioFile);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить слово' })
  @ApiResponse({ status: 200, description: 'Слово удалено' })
  @ApiResponse({ status: 404, description: 'Слово не найдено' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.wordsService.remove(id);
  }

  @Delete('batch')
  @ApiOperation({ summary: 'Массовое удаление слов' })
  @ApiResponse({ status: 200, description: 'Слова удалены' })
  @ApiResponse({ status: 400, description: 'Ошибка валидации' })
  batchDelete(@Body() batchDeleteDto: BatchDeleteWordsDto) {
    return this.wordsService.batchDelete(batchDeleteDto);
  }

  @Patch('batch/move')
  @ApiOperation({ summary: 'Массовое перемещение слов в другой урок' })
  @ApiResponse({ status: 200, description: 'Слова перемещены' })
  @ApiResponse({ status: 400, description: 'Ошибка валидации' })
  @ApiResponse({ status: 404, description: 'Урок не найден' })
  batchMove(@Body() batchMoveDto: BatchMoveWordsDto) {
    return this.wordsService.batchMove(batchMoveDto);
  }
}
