import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Grade } from './grade.entity'

@Entity('class')
export class Class {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id!: number

  @Column({ type: 'int', nullable: true })
  classNo?: number

  @Column({ type: 'varchar', length: 50 })
  className!: string

  @Column({ type: 'int' })
  gradeId!: number

  @ManyToOne(() => Grade)
  @JoinColumn({ name: 'gradeId' })
  grade?: Grade

  @Column({ type: 'int', nullable: true })
  teacherId?: number

  @Column({ type: 'int', default: 0 })
  studentCount!: number

  @Column({ type: 'int', default: 1 })
  status!: number

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}