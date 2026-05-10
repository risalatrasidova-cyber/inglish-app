import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { LevelProgress } from '../progress/entities/level-progress.entity';
import { Reward } from '../progress/entities/reward.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, LevelProgress, Reward])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

