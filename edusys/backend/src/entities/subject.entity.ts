import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm'

@Entity('subject')
@Index('idx_subject_name', ['subjectName'])
@Index('idx_subject_status', ['status'])
export class Subject {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id!: number

  @Column({ type: 'varchar', length: 50 })
  subjectName!: string

  @Column({ type: 'varchar', length: 50, nullable: true })
  subjectCode?: string

  @Column({ type: 'int', default: 1 })
  credit!: number

  @Column({ type: 'int', default: 1 })
  status!: number

  @Column({ type: 'varchar', length: 500, nullable: true })
  description?: string

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}