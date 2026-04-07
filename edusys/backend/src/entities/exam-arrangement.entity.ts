import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm'
import { Exam } from './exam.entity'
import { Subject } from './subject.entity'
import { Student } from './student.entity'
import { SubjectGroup } from './subject-group.entity'

// 考点
@Entity('exam_venue')
@Index('idx_venue_status', ['status'])
export class ExamVenue {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id!: number

  @Column({ type: 'varchar', length: 100 })
  venueName!: string

  @Column({ type: 'varchar', length: 50 })
  venueCode!: string

  @Column({ type: 'varchar', length: 200, nullable: true })
  address?: string

  @Column({ type: 'varchar', length: 50, nullable: true })
  principal?: string

  @Column({ type: 'varchar', length: 20, nullable: true })
  contactPhone?: string

  @Column({ type: 'int', default: 0 })
  roomCount!: number

  @Column({ type: 'int', default: 0 })
  capacity!: number

  @Column({ type: 'text', nullable: true })
  remark?: string

  @Column({ type: 'int', default: 1 })
  status!: number

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}

// 考场
@Entity('exam_room')
export class ExamRoom {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id!: number

  @Column({ type: 'int' })
  venueId!: number

  @ManyToOne(() => ExamVenue)
  @JoinColumn({ name: 'venueId' })
  venue?: ExamVenue

  @Column({ type: 'varchar', length: 50 })
  roomName!: string

  @Column({ type: 'varchar', length: 20 })
  roomCode!: string

  @Column({ type: 'int', default: 30 })
  capacity!: number

  @Column({ type: 'int', default: 0 })
  currentCount!: number

  @Column({ type: 'varchar', length: 100, nullable: true })
  location?: string

  @Column({ type: 'int', default: 1 })
  status!: number

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}

// 考试场次
@Entity('exam_session')
export class ExamSession {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id!: number

  @Column({ type: 'int' })
  examId!: number

  @ManyToOne(() => Exam, { nullable: true })
  @JoinColumn({ name: 'examId' })
  exam?: Exam

  @Column({ type: 'int' })
  sessionNo!: number

  @Column({ type: 'varchar', length: 100 })
  sessionName!: string

  @Column({ type: 'int', nullable: true })
  subjectId?: number

  @ManyToOne(() => Subject, { nullable: true })
  @JoinColumn({ name: 'subjectId' })
  subject?: Subject

  @Column({ type: 'date', nullable: true })
  examDate?: Date

  @Column({ type: 'time', nullable: true })
  startTime?: string

  @Column({ type: 'time', nullable: true })
  endTime?: string

  @Column({ type: 'text', nullable: true })
  remark?: string

  @Column({ name: 'applicable_groups', type: 'jsonb', default: [] })
  applicableGroups!: number[]

  @Column({ type: 'int', default: 1 })
  status!: number

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}

// 考试编排
@Entity('exam_arrangement')
export class ExamArrangement {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id!: number

  @Column({ type: 'int' })
  examId!: number

  @ManyToOne(() => Exam, { nullable: true })
  @JoinColumn({ name: 'examId' })
  exam?: Exam

  @Column({ type: 'int' })
  sessionId!: number

  @ManyToOne(() => ExamSession, { nullable: true })
  @JoinColumn({ name: 'sessionId' })
  session?: ExamSession

  @Column({ type: 'int' })
  studentId!: number

  @ManyToOne(() => Student, { nullable: true })
  @JoinColumn({ name: 'studentId' })
  student?: Student

  @Column({ type: 'int' })
  venueId!: number

  @ManyToOne(() => ExamVenue, { nullable: true })
  @JoinColumn({ name: 'venueId' })
  venue?: ExamVenue

  @Column({ type: 'int' })
  roomId!: number

  @ManyToOne(() => ExamRoom, { nullable: true })
  @JoinColumn({ name: 'roomId' })
  room?: ExamRoom

  @Column({ type: 'varchar', length: 50 })
  ticketNo!: string

  @Column({ type: 'int' })
  seatNo!: number

  @Column({ type: 'varchar', length: 100, nullable: true })
  subjectName?: string

  @Column({ type: 'int', default: 0 })
  isPrint!: number

  @Column({ name: 'arrange_type', type: 'varchar', length: 20, default: 'manual' })
  arrangeType!: string

  @Column({ name: 'group_id', type: 'int', nullable: true })
  groupId?: number

  @ManyToOne(() => SubjectGroup, { nullable: true })
  @JoinColumn({ name: 'groupId' })
  group?: SubjectGroup

  @Column({ type: 'int', default: 1 })
  status!: number

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}

// 学业水平成绩
@Entity('year_score')
export class YearScore {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id!: number

  @Column({ type: 'int' })
  studentId!: number

  @Column({ type: 'int' })
  subjectId!: number

  @Column({ type: 'int' })
  examId!: number

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  score?: number

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  rank?: number

  @Column({ type: 'varchar', length: 20, default: '2025-2026' })
  schoolYear!: string

  @Column({ type: 'varchar', length: 20, default: '第一学期' })
  semester!: string

  @Column({ type: 'int', default: 1 })
  status!: number

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
