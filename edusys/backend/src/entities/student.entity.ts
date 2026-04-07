import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm'
import { Class } from './class.entity'

@Entity('student')
@Index('idx_student_name', ['name'])
@Index('idx_student_class', ['classId'])
@Index('idx_student_status', ['status'])
@Index('idx_student_phone', ['phone'])
export class Student {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id!: number

  @Column({ type: 'varchar', length: 50, nullable: true })
  studentNo?: string

  @Column({ type: 'varchar', length: 50, nullable: true })
  studentId?: string

  @Column({ type: 'varchar', length: 50, nullable: true })
  idCard?: string

  @Column({ type: 'varchar', length: 50 })
  name!: string

  @Column({ type: 'int', nullable: true })
  classId?: number

  @ManyToOne(() => Class)
  @JoinColumn({ name: 'classId' })
  class?: Class

  @Column({ type: 'varchar', length: 50, nullable: true })
  year1Class?: string

  @Column({ type: 'varchar', length: 50, nullable: true })
  year2Class?: string

  @Column({ type: 'varchar', length: 50, nullable: true })
  year3Class?: string

  @Column({ type: 'int', nullable: true })
  seatNo?: number

  @Column({ type: 'varchar', length: 10, nullable: true })
  gender?: string

  @Column({ type: 'date', nullable: true })
  birthDate?: Date

  @Column({ type: 'varchar', length: 50, nullable: true })
  subjects?: string

  @Column({ type: 'varchar', length: 50, nullable: true })
  schoolType?: string

  @Column({ type: 'varchar', length: 50, nullable: true })
  source?: string

  @Column({ type: 'varchar', length: 20, nullable: true })
  subjectType?: string

  @Column({ type: 'int', default: 1 })
  status!: number

  @Column({ type: 'int', nullable: true })
  userId?: number

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string

  @Column({ type: 'varchar', length: 100, nullable: true })
  address?: string

  @Column({ type: 'varchar', length: 10, default: '否' })
  leaveStatus!: string

  @Column({ type: 'varchar', length: 10, default: '是' })
  qualityAnalysis!: string

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}