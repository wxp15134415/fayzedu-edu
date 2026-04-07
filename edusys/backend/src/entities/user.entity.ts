import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm'
import { Role } from './role.entity'

@Entity('sys_user')
@Index('idx_user_username', ['username'])
@Index('idx_user_role', ['roleId'])
@Index('idx_user_status', ['status'])
export class User {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number

  @Column({ type: 'varchar', length: 50, unique: true })
  username: string

  @Column({ type: 'varchar', length: 255 })
  password: string

  @Column({ type: 'varchar', length: 100 })
  realName: string

  @Column({ name: 'role_id', type: 'bigint' })
  roleId: number

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id' })
  role: Role

  @Column({ name: 'grade_ids', type: 'text', nullable: true })
  gradeIds: string

  @Column({ name: 'class_ids', type: 'text', nullable: true })
  classIds: string

  @Column({ name: 'student_id', type: 'bigint', nullable: true })
  studentId: number

  @Column({ type: 'smallint', default: 1 })
  status: number

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string

  @Column({ name: 'last_login_time', type: 'timestamp', nullable: true })
  lastLoginTime: Date

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}