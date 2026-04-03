import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Student } from './student.entity'

@Entity('score')
export class Score {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id!: number

  @Column({ type: 'int', nullable: true })
  examId?: number

  @Column({ type: 'int' })
  studentId!: number

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'studentId' })
  student?: Student

  // 总分
  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  totalScore?: number

  @Column({ type: 'int', nullable: true })
  totalRank?: number

  @Column({ type: 'int', nullable: true })
  totalRankExam?: number

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  totalScoreWeighted?: number

  @Column({ type: 'int', nullable: true })
  totalRankWeighted?: number

  @Column({ type: 'int', nullable: true })
  totalRankWeightedExam?: number

  // 语文
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  chinese?: number

  @Column({ type: 'int', nullable: true })
  chineseRank?: number

  @Column({ type: 'int', nullable: true })
  chineseRankExam?: number

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  chineseWeighted?: number

  // 数学
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  math?: number

  @Column({ type: 'int', nullable: true })
  mathRank?: number

  @Column({ type: 'int', nullable: true })
  mathRankExam?: number

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  mathWeighted?: number

  // 英语
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  english?: number

  @Column({ type: 'int', nullable: true })
  englishRank?: number

  @Column({ type: 'int', nullable: true })
  englishRankExam?: number

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  englishWeighted?: number

  // 物理
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  physics?: number

  @Column({ type: 'int', nullable: true })
  physicsRank?: number

  @Column({ type: 'int', nullable: true })
  physicsRankExam?: number

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  physicsWeighted?: number

  // 化学
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  chemistry?: number

  @Column({ type: 'int', nullable: true })
  chemistryRank?: number

  @Column({ type: 'int', nullable: true })
  chemistryRankExam?: number

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  chemistryWeighted?: number

  // 生物
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  biology?: number

  @Column({ type: 'int', nullable: true })
  biologyRank?: number

  @Column({ type: 'int', nullable: true })
  biologyRankExam?: number

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  biologyWeighted?: number

  // 政治
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  politics?: number

  @Column({ type: 'int', nullable: true })
  politicsRank?: number

  @Column({ type: 'int', nullable: true })
  politicsRankExam?: number

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  politicsWeighted?: number

  // 历史
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  history?: number

  @Column({ type: 'int', nullable: true })
  historyRank?: number

  @Column({ type: 'int', nullable: true })
  historyRankExam?: number

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  historyWeighted?: number

  // 地理
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  geography?: number

  @Column({ type: 'int', nullable: true })
  geographyRank?: number

  @Column({ type: 'int', nullable: true })
  geographyRankExam?: number

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  geographyWeighted?: number

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}