import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Admin } from './admin.entity';

@Entity('admin_logs')
export class AdminLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'admin_id' })
  @Index()
  admin_id: number;

  @Column({ type: 'varchar', length: 50 })
  action: string; // create, update, delete

  @Column({ type: 'varchar', length: 50 })
  @Index()
  entity_type: string; // lesson, word, user, admin

  @Column({ type: 'int', nullable: true })
  @Index()
  entity_id: number | null;

  @Column({ type: 'json', nullable: true })
  details: any; // JSON с деталями действия

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip_address: string | null;

  @CreateDateColumn()
  @Index()
  created_at: Date;

  // Relations
  @ManyToOne(() => Admin, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'admin_id' })
  admin: Admin | null;
}

