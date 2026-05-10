import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { LessonsUserController } from './lessons-user.controller';
import { Lesson } from './entities/lesson.entity';
import { Word } from '../words/entities/word.entity';
import { LevelProgress } from '../progress/entities/level-progress.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lesson, Word, LevelProgress])],
  controllers: [LessonsController, LessonsUserController],
  providers: [LessonsService],
  exports: [LessonsService],
})
export class LessonsModule {}

