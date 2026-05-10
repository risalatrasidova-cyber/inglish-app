import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Word } from './entities/word.entity';
import * as fs from 'fs';
import * as path from 'path';

@ApiTags('Audio')
@Controller('audio')
export class AudioController {
  constructor(
    @InjectRepository(Word)
    private wordRepository: Repository<Word>,
  ) {}

  @Get(':wordId')
  @ApiOperation({ summary: 'Получить аудио файл слова' })
  @ApiResponse({ status: 200, description: 'Аудио файл', type: 'application/octet-stream' })
  @ApiResponse({ status: 404, description: 'Слово или аудио файл не найдены' })
  async getAudio(
    @Param('wordId', ParseIntPipe) wordId: number,
    @Res() res: Response,
  ) {
    const word = await this.wordRepository.findOne({
      where: { id: wordId },
    });

    if (!word) {
      throw new NotFoundException(`Word with ID ${wordId} not found`);
    }

    if (!word.audio_file_path) {
      throw new NotFoundException('Audio file not found for this word');
    }

    // Получаем полный путь к файлу
    const filePath = path.join(process.cwd(), word.audio_file_path);

    // Проверяем существование файла
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Audio file not found');
    }

    // Отправляем файл
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `inline; filename="${word.audio_file_name || 'audio.mp3'}"`);
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }
}

