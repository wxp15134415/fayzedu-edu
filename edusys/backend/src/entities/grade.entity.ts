import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('grade')
export class Grade {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id!: number

  @Column({ type: 'varchar', length: 50 })
  gradeName!: string

  @Column({ type: 'varchar', length: 20, default: '2025-2026' })
  schoolYear!: string

  @Column({ type: 'int', default: 2025 })
  entranceYear!: number

  @Column({ type: 'varchar', length: 20, default: '高中' })
  period!: string

  @Column({ type: 'varchar', length: 20, default: '第一学期' })
  semester!: string

  @Column({ type: 'int', default: 0 })
  studentCount!: number

  @Column({ type: 'int', default: 0 })
  classCount!: number

  @Column({ type: 'int', default: 1 })
  status!: number

  @Column({ type: 'varchar', length: 500, nullable: true })
  description?: string

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
