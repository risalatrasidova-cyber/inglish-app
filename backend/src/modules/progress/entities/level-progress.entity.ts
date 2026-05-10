import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Lesson } from '../../lessons/entities/lesson.entity';

@Entity('level_progress')
@Unique(['user_id', 'lesson_id', 'level_number'])
export class LevelProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  @Index()
  user_id: number;

  @Column({ name: 'lesson_id' })
  @Index()
  lesson_id: number;

  @Column({ type: 'tinyint' })
  level_number: number; // 1, 2 или 3

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0.0 })
  best_percentage: number;

  @Column({ type: 'int', default: 0 })
  total_correct_answers: number;

  @Column({ type: 'int', default: 0 })
  total_attempts: number;

  @Column({ type: 'boolean', default: false })
  is_completed: boolean;

  @Column({ type: 'boolean', default: false })
  has_gold_star: boolean;

  @Column({ type: 'boolean', default: false })
  has_diamond_star: boolean;

  @Column({ type: 'datetime', nullable: true })
  first_started_at: Date | null;

  @Column({ type: 'datetime', nullable: true })
  last_played_at: Date | null;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Lesson, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;
}

