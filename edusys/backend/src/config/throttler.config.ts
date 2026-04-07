import { Module } from '@nestjs/common'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'

// 开发环境不使用速率限制
const isDevelopment = process.env.NODE_ENV !== 'production'

@Module({
  imports: [
    // 开发环境不启用速率限制
    isDevelopment ? ThrottlerModule.forRoot([]) : ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 100,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 100,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 500,
      },
    ]),
  ],
  providers: [
    // 开发环境不启用速率限制守卫
    ...(isDevelopment ? [] : [{
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    }]),
  ],
  exports: [ThrottlerModule],
})
export class ThrottlerConfigModule {}
