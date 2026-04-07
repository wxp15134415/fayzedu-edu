import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm'
import { Subject } from './subject.entity'

@Entity('teacher')
@Index('idx_teacher_name', ['name'])
@Index('idx_teacher_phone', ['phone'])
@Index('idx_teacher_status', ['status'])
@Index('idx_teacher_subject', ['subjectId'])
export class Teacher {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id!: number

  @Column({ type: 'varchar', length: 50, unique: true })
  teacherNo!: string

  @Column({ type: 'varchar', length: 50, nullable: true })
  teacherId?: string

  @Column({ type: 'varchar', length: 50, nullable: true })
  idCard?: string

  @Column({ type: 'varchar', length: 50 })
  name!: string

  @Column({ type: 'varchar', length: 10, nullable: true })
  gender?: string

  @Column({ type: 'date', nullable: true })
  birthDate?: Date

  @Column({ type: 'varchar', length: 50, nullable: true })
  nation?: string

  @Column({ type: 'varchar', length: 100, nullable: true })
  nativePlace?: string

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string

  @Column({ type: 'varchar', length: 100, nullable: true })
  email?: string

  @Column({ type: 'varchar', length: 200, nullable: true })
  address?: string

  @Column({ type: 'int', nullable: true })
  subjectId?: number

  @ManyToOne(() => Subject)
  @JoinColumn({ name: 'subjectId' })
  subject?: Subject

  @Column({ type: 'varchar', length: 50, nullable: true })
  education?: string

  @Column({ type: 'varchar', length: 50, nullable: true })
  degree?: string

  @Column({ type: 'date', nullable: true })
  hireDate?: Date

  @Column({ type: 'varchar', length: 50, nullable: true })
  position?: string

  @Column({ type: 'varchar', length: 50, nullable: true })
  title?: string

  @Column({ type: 'varchar', length: 100, nullable: true })
  graduateSchool?: string

  @Column({ type: 'int', nullable: true })
  userId?: number

  @Column({ type: 'int', default: 1 })
  status!: number

  @Column({ type: 'text', nullable: true })
  remark?: string

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
