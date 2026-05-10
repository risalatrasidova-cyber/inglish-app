import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WordsService } from './words.service';
import { WordsController } from './words.controller';
import { AudioController } from './audio.controller';
import { Word } from './entities/word.entity';
import { Lesson } from '../lessons/entities/lesson.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Word, Lesson])],
  controllers: [WordsController, AudioController],
  providers: [WordsService],
  exports: [WordsService],
})
export class WordsModule {}

