import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Grade } from './grade.entity'

@Entity('exam')
export class Exam {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id!: number

  @Column({ type: 'varchar', length: 100 })
  examName!: string

  @Column({ type: 'int', nullable: true })
  gradeId?: number

  @ManyToOne(() => Grade, { nullable: true })
  @JoinColumn({ name: 'gradeId' })
  grade?: Grade

  @Column({ type: 'varchar', length: 20, default: '2025-2026' })
  schoolYear!: string

  @Column({ type: 'varchar', length: 20, default: '第一学期' })
  semester!: string

  @Column({ type: 'varchar', length: 20, default: '月考' })
  examType!: string

  @Column({ type: 'date', nullable: true })
  examDate?: Date

  @Column({ type: 'int', default: 1 })
  status!: number

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}