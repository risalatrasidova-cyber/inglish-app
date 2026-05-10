import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { LevelProgress } from '../progress/entities/level-progress.entity';
import { Reward } from '../progress/entities/reward.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(LevelProgress)
    private levelProgressRepository: Repository<LevelProgress>,
    @InjectRepository(Reward)
    private rewardRepository: Repository<Reward>,
  ) {}

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      login: user.login,
      total_money: user.total_money,
      created_at: user.created_at,
      last_login: user.last_login,
    };
  }

  async getUserStats(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Статистика по уровням
    const completedLevels = await this.levelProgressRepository.count({
      where: {
        user_id: userId,
        is_completed: true,
      },
    });

    const goldStars = await this.levelProgressRepository.count({
      where: {
        user_id: userId,
        has_gold_star: true,
      },
    });

    const diamondStars = await this.levelProgressRepository.count({
      where: {
        user_id: userId,
        has_diamond_star: true,
      },
    });

    // Общее количество заработанных денег
    const totalEarned = await this.rewardRepository
      .createQueryBuilder('reward')
      .select('SUM(reward.amount)', 'total')
      .where('reward.user_id = :userId', { userId })
      .getRawOne();

    return {
      user: {
        id: user.id,
        login: user.login,
        total_money: user.total_money,
      },
      stats: {
        completed_levels: completedLevels,
        gold_stars: goldStars,
        diamond_stars: diamondStars,
        total_earned: parseInt(totalEarned?.total || '0', 10),
      },
    };
  }
}

