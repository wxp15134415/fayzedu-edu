import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OperationLog } from '../../entities/operation-log.entity'
import { OperationLogService } from './operation-log.service'
import { OperationLogController } from './operation-log.controller'

@Module({
  imports: [TypeOrmModule.forFeature([OperationLog])],
  controllers: [OperationLogController],
  providers: [OperationLogService],
  exports: [OperationLogService]
})
export class OperationLogModule {}