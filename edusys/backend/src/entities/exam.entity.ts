import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm'
import { Grade } from './grade.entity'

@Entity('exam')
@Index('idx_exam_grade', ['gradeId'])
@Index('idx_exam_status', ['status'])
@Index('idx_exam_date', ['examDate'])
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

  // 是否已导入成绩 0-未导入, 1-已导入
  @Column({ name: 'has_scores', type: 'int', default: 0 })
  hasScores!: number

  // 成绩导入时间
  @Column({ name: 'score_import_time', type: 'timestamp', nullable: true })
  scoreImportTime?: Date

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}