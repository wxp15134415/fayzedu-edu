import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm'
import { Student } from './student.entity'
import { Exam } from './exam.entity'

/**
 * 原始成绩表
 * 用于存储导入的原始成绩数据，与考试关联
 * 状态: 0-待确认, 1-已确认(正式成绩), 2-已放弃
 */
@Entity('exam_score')
@Index('idx_exam_score_exam', ['examId'])
@Index('idx_exam_score_student', ['studentId'])
@Index('idx_exam_score_batch', ['importBatch'])
export class ExamScore {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id!: number

  @Column({ name: 'exam_id', type: 'int', nullable: true })
  examId?: number

  @ManyToOne(() => Exam, { nullable: true })
  @JoinColumn({ name: 'examId' })
  exam?: Exam

  @Column({ name: 'student_id', type: 'int' })
  studentId!: number

  @ManyToOne(() => Student, { eager: true })
  @JoinColumn({ name: 'student_id' })
  student?: Student

  // 导入批次号
  @Column({ name: 'import_batch', type: 'varchar', length: 50, nullable: true })
  importBatch?: string

  // 总分
  @Column({ name: 'total_score', type: 'decimal', precision: 6, scale: 2, nullable: true })
  totalScore?: number

  @Column({ name: 'total_rank', type: 'int', nullable: true })
  totalRank?: number

  @Column({ name: 'total_score_assign', type: 'decimal', precision: 6, scale: 2, nullable: true })
  totalScoreAssign?: number

  @Column({ name: 'total_rank_assign', type: 'int', nullable: true })
  totalRankAssign?: number

  // 语文
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  chinese?: number

  @Column({ name: 'chinese_rank', type: 'int', nullable: true })
  chineseRank?: number

  @Column({ name: 'chinese_assign', type: 'decimal', precision: 5, scale: 2, nullable: true })
  chineseAssign?: number

  @Column({ name: 'chinese_rank_assign', type: 'int', nullable: true })
  chineseRankAssign?: number

  // 数学
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  math?: number

  @Column({ name: 'math_rank', type: 'int', nullable: true })
  mathRank?: number

  @Column({ name: 'math_assign', type: 'decimal', precision: 5, scale: 2, nullable: true })
  mathAssign?: number

  @Column({ name: 'math_rank_assign', type: 'int', nullable: true })
  mathRankAssign?: number

  // 英语
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  english?: number

  @Column({ name: 'english_rank', type: 'int', nullable: true })
  englishRank?: number

  @Column({ name: 'english_assign', type: 'decimal', precision: 5, scale: 2, nullable: true })
  englishAssign?: number

  @Column({ name: 'english_rank_assign', type: 'int', nullable: true })
  englishRankAssign?: number

  // 物理
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  physics?: number

  @Column({ name: 'physics_rank', type: 'int', nullable: true })
  physicsRank?: number

  @Column({ name: 'physics_assign', type: 'decimal', precision: 5, scale: 2, nullable: true })
  physicsAssign?: number

  @Column({ name: 'physics_rank_assign', type: 'int', nullable: true })
  physicsRankAssign?: number

  // 化学
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  chemistry?: number

  @Column({ name: 'chemistry_rank', type: 'int', nullable: true })
  chemistryRank?: number

  @Column({ name: 'chemistry_assign', type: 'decimal', precision: 5, scale: 2, nullable: true })
  chemistryAssign?: number

  @Column({ name: 'chemistry_rank_assign', type: 'int', nullable: true })
  chemistryRankAssign?: number

  // 生物
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  biology?: number

  @Column({ name: 'biology_rank', type: 'int', nullable: true })
  biologyRank?: number

  @Column({ name: 'biology_assign', type: 'decimal', precision: 5, scale: 2, nullable: true })
  biologyAssign?: number

  @Column({ name: 'biology_rank_assign', type: 'int', nullable: true })
  biologyRankAssign?: number

  // 政治
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  politics?: number

  @Column({ name: 'politics_rank', type: 'int', nullable: true })
  politicsRank?: number

  @Column({ name: 'politics_assign', type: 'decimal', precision: 5, scale: 2, nullable: true })
  politicsAssign?: number

  @Column({ name: 'politics_rank_assign', type: 'int', nullable: true })
  politicsRankAssign?: number

  // 历史
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  history?: number

  @Column({ name: 'history_rank', type: 'int', nullable: true })
  historyRank?: number

  @Column({ name: 'history_assign', type: 'decimal', precision: 5, scale: 2, nullable: true })
  historyAssign?: number

  @Column({ name: 'history_rank_assign', type: 'int', nullable: true })
  historyRankAssign?: number

  // 地理
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  geography?: number

  @Column({ name: 'geography_rank', type: 'int', nullable: true })
  geographyRank?: number

  @Column({ name: 'geography_assign', type: 'decimal', precision: 5, scale: 2, nullable: true })
  geographyAssign?: number

  @Column({ name: 'geography_rank_assign', type: 'int', nullable: true })
  geographyRankAssign?: number

  // 状态: 0-待确认, 1-已确认(正式成绩), 2-已放弃
  @Column({ type: 'int', default: 0 })
  status!: number

  // 匹配方式
  @Column({ name: 'matched_method', type: 'varchar', length: 50, nullable: true })
  matchedMethod?: string

  // 原始数据备份 (JSON)
  @Column({ type: 'jsonb', nullable: true })
  rawData?: any

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date
}
