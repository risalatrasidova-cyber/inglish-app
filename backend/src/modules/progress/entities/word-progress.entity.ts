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
import { Word } from '../../words/entities/word.entity';
import { Lesson } from '../../lessons/entities/lesson.entity';

@Entity('word_progress')
@Unique(['user_id', 'word_id', 'level_number'])
export class WordProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  @Index()
  user_id: number;

  @Column({ name: 'word_id' })
  @Index()
  word_id: number;

  @Column({ name: 'lesson_id' })
  @Index()
  lesson_id: number;

  @Column({ type: 'smallint' })
  level_number: number; // 1, 2 или 3

  @Column({ type: 'boolean', default: false })
  @Index()
  is_passed: boolean;

  @Column({ type: 'int', default: 0 })
  correct_count: number;

  @Column({ type: 'timestamp', nullable: true })
  first_correct_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  last_correct_at: Date | null;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Word, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'word_id' })
  word: Word;

  @ManyToOne(() => Lesson, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;
}

