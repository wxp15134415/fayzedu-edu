import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common'
import { OperationLogService } from './operation-log.service'

@Controller('operation-log')
export class OperationLogController {
  constructor(private readonly logService: OperationLogService) {}

  /**
   * 分页查询操作日志
   */
  @Get('list')
  async findAll(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 20,
    @Query('module') module?: string,
    @Query('operation') operation?: string,
    @Query('userId') userId?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.logService.findAll({
      page: Number(page),
      pageSize: Number(pageSize),
      module,
      operation,
      userId: userId ? Number(userId) : undefined,
      startDate,
      endDate
    })
  }

  /**
   * 获取日志详情
   */
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.logService.findOne(id)
  }

  /**
   * 获取模块列表
   */
  @Get('modules')
  async getModules() {
    return this.logService.getModules()
  }

  /**
   * 获取操作类型列表
   */
  @Get('operations')
  async getOperations() {
    return this.logService.getOperations()
  }
}