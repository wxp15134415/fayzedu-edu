import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Between, Like } from 'typeorm'
import { OperationLog } from '../../entities/operation-log.entity'

@Injectable()
export class OperationLogService {
  constructor(
    @InjectRepository(OperationLog)
    private logRepository: Repository<OperationLog>
  ) {}

  /**
   * 创建操作日志
   */
  async create(logData: Partial<OperationLog>): Promise<OperationLog> {
    const log = this.logRepository.create(logData)
    return this.logRepository.save(log)
  }

  /**
   * 分页查询操作日志
   */
  async findAll(params: {
    page: number
    pageSize: number
    module?: string
    operation?: string
    userId?: number
    startDate?: string
    endDate?: string
  }) {
    const { page, pageSize, module, operation, userId, startDate, endDate } = params

    const where: any = {}
    if (module) where.module = module
    if (operation) where.operation = operation
    if (userId) where.userId = userId
    if (startDate && endDate) {
      where.createdAt = Between(new Date(startDate), new Date(endDate))
    }

    const [list, total] = await this.logRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize
    })

    return { list, total, page, pageSize }
  }

  /**
   * 获取日志详情
   */
  async findOne(id: number): Promise<OperationLog | null> {
    return this.logRepository.findOne({ where: { id } })
  }

  /**
   * 获取模块列表（用于筛选）
   */
  async getModules(): Promise<string[]> {
    const result = await this.logRepository
      .createQueryBuilder('log')
      .select('DISTINCT log.module', 'module')
      .getRawMany()
    return result.map(r => r.module)
  }

  /**
   * 获取操作类型列表（用于筛选）
   */
  async getOperations(): Promise<string[]> {
    const result = await this.logRepository
      .createQueryBuilder('log')
      .select('DISTINCT log.operation', 'operation')
      .getRawMany()
    return result.map(r => r.operation)
  }
}