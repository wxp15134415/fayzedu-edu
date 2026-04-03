import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('system_info')
export class SystemInfo {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id!: number

  @Column({ type: 'varchar', length: 100, default: '学校管理系统' })
  schoolName!: string

  @Column({ type: 'varchar', length: 20, default: '2025-2026' })
  currentYear!: string

  @Column({ type: 'int', default: 1 })
  currentSemester!: number

  @Column({ type: 'varchar', length: 255, nullable: true })
  address?: string

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string

  @Column({ type: 'varchar', length: 100, nullable: true })
  email?: string

  @Column({ type: 'text', nullable: true })
  description?: string

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
