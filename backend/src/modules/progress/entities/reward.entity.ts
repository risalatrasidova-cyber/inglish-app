import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Lesson } from '../../lessons/entities/lesson.entity';
import { Word } from '../../words/entities/word.entity';

export enum RewardType {
  WORD = 'word',
  LEVEL_90 = 'level_90',
  LEVEL_100 = 'level_100',
}

@Entity('rewards')
@Unique(['user_id', 'reward_type', 'lesson_id', 'word_id', 'level_number'])
export class Reward {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  @Index()
  user_id: number;

  @Column({
    type: 'varchar',
    length: '50',
    // enum в TypeScript; в БД храним как строку (совместимо с SQLite и PostgreSQL)
  })
  @Index()
  reward_type: RewardType;

  @Column({ name: 'lesson_id', nullable: true })
  lesson_id: number | null;

  @Column({ name: 'word_id', nullable: true })
  word_id: number | null;

  @Column({ type: 'smallint', nullable: true })
  level_number: number | null;

  @Column({ type: 'int' })
  amount: number; // 5, 100 или 150

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Lesson, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson | null;

  @ManyToOne(() => Word, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'word_id' })
  word: Word | null;
}

