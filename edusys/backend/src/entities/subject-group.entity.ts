import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Student } from './student.entity'
import { Subject } from './subject.entity'

// 选科组合
@Entity('subject_group')
export class SubjectGroup {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id!: number

  @Column({ type: 'varchar', length: 20, unique: true })
  groupCode!: string

  @Column({ type: 'varchar', length: 50 })
  groupName!: string

  @Column({ type: 'text', nullable: true })
  description?: string

  @Column({ type: 'int', default: 1 })
  status!: number

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}

// 组合科目（多对多）
@Entity('subject_group_subject')
export class SubjectGroupSubject {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id!: number

  @Column({ type: 'int' })
  groupId!: number

  @ManyToOne(() => SubjectGroup)
  @JoinColumn({ name: 'groupId' })
  group?: SubjectGroup

  @Column({ type: 'int' })
  subjectId!: number

  @ManyToOne(() => Subject)
  @JoinColumn({ name: 'subjectId' })
  subject?: Subject

  @Column({ type: 'int', default: 0 })
  sortOrder!: number

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}

// 学生选科（记录每个学生选的科目）
@Entity('student_subject')
export class StudentSubject {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id!: number

  @Column({ type: 'int' })
  studentId!: number

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'studentId' })
  student?: Student

  @Column({ type: 'int' })
  subjectId!: number

  @ManyToOne(() => Subject)
  @JoinColumn({ name: 'subjectId' })
  subject?: Subject

  @Column({ type: 'boolean', default: true })
  isSelected!: boolean

  @Column({ type: 'int', default: 1 })
  status!: number

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}

// 学生选科组合
@Entity('student_group')
export class StudentGroup {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id!: number

  @Column({ type: 'int' })
  studentId!: number

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'studentId' })
  student?: Student

  @Column({ type: 'int' })
  groupId!: number

  @ManyToOne(() => SubjectGroup)
  @JoinColumn({ name: 'groupId' })
  group?: SubjectGroup

  @Column({ type: 'int', default: 1 })
  status!: number

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
