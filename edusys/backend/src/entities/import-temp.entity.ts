import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

/**
 * 通用导入临时表
 * 用于存储导入过程中的临时数据
 */
@Entity('import_temp')
export class ImportTemp {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id!: number

  @Column({ name: 'batch_no', type: 'varchar', length: 50 })
  batchNo!: string

  @Column({ name: 'module', type: 'varchar', length: 50 })
  module!: string

  @Column({ type: 'jsonb', name: 'data' })
  data!: Record<string, any>

  @Column({ name: 'row_index', type: 'int' })
  rowIndex!: number

  @Column({ type: 'int', name: 'status', default: 0 })
  status!: number // 0:待处理 1:有效 2:无效 3:已导入 4:导入失败

  @Column({ name: 'error_msg', type: 'text', nullable: true })
  errorMsg?: string

  @Column({ type: 'int', name: 'is_new', default: 1 })
  isNew!: number // 0:更新 1:新增

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date
}