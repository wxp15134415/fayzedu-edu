import { Module, Global } from '@nestjs/common'
import { OperationLogInterceptor } from '../interceptors/operation-log.interceptor'
import { DataSource } from 'typeorm'

@Global()
@Module({
  providers: [
    {
      provide: OperationLogInterceptor,
      inject: [DataSource],
      useFactory: (dataSource: DataSource) => new OperationLogInterceptor(dataSource)
    }
  ],
  exports: [OperationLogInterceptor]
})
export class InterceptorModule {}