import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('exam')
export class Exam {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id!: number

  @Column({ type: 'varchar', length: 100 })
  examName!: string

  @Column({ type: 'int', nullable: true })
  gradeId?: number

  @Column({ type: 'varchar', length: 20 })
  schoolYear!: string

  @Column({ type: 'varchar', length: 20 })
  semester!: string

  @Column({ type: 'varchar', length: 20 })
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