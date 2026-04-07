import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm'

/**
 * 操作日志表
 * 记录用户的重要操作行为（登录、导入、导出、修改等）
 */
@Entity('operation_log')
@Index('idx_log_user', ['userId'])
@Index('idx_log_created', ['createdAt'])
@Index('idx_log_module', ['module'])
export class OperationLog {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'user_id' })
  userId: number

  @Column({ name: 'user_name', length: 50 })
  userName: string

  @Column({ name: 'module', length: 50 })
  module: string // 操作模块，如：teacher, student, score-import

  @Column({ name: 'operation', length: 50 })
  operation: string // 操作类型，如：import, export, create, update, delete

  @Column({ name: 'method', length: 20 })
  method: string // HTTP 方法，如：POST, PUT, DELETE

  @Column({ name: 'path', length: 200 })
  path: string // 请求路径

  @Column({ type: 'text', name: 'request_body', nullable: true })
  requestBody: string // 请求体（可选，敏感信息需脱敏）

  @Column({ type: 'int', name: 'status_code', nullable: true })
  statusCode: number // 响应状态码

  @Column({ name: 'ip', length: 50, nullable: true })
  ip: string // IP 地址

  @Column({ name: 'user_agent', length: 500, nullable: true })
  userAgent: string // 用户代理

  @Column({ type: 'text', name: 'error_msg', nullable: true })
  errorMsg: string // 错误信息（如有）

  @Column({ name: 'duration', type: 'int', nullable: true })
  duration: number // 请求耗时（毫秒）

  @Column({ type: 'jsonb', name: 'extra', nullable: true })
  extra: Record<string, any> // 额外信息，如：导入数量、导出数量等

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}