import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';
import { Word } from '../words/entities/word.entity';
import { LevelProgress } from './entities/level-progress.entity';
import { WordProgress } from './entities/word-progress.entity';
import { Reward } from './entities/reward.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Word,
      LevelProgress,
      WordProgress,
      Reward,
      User,
    ]),
  ],
  controllers: [ProgressController],
  providers: [ProgressService],
  exports: [ProgressService],
})
export class ProgressModule {}

