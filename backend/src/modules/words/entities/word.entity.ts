import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Lesson } from '../../lessons/entities/lesson.entity';

@Entity('words')
export class Word {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  english_word: string;

  @Column({ type: 'varchar', length: 255 })
  russian_translation: string;

  @Column({ name: 'lesson_id' })
  lesson_id: number;

  @Column({ type: 'varchar', length: 500 })
  audio_file_path: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  audio_file_name: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Lesson, (lesson) => lesson.words, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;
}

