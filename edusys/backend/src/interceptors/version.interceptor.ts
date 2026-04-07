import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

// API 版本配置
export const API_VERSION = '1.0.0'
export const API_BUILD_DATE = '2026-04-04'

@Injectable()
export class VersionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse()

    // 添加版本响应头
    response.setHeader('X-API-Version', API_VERSION)
    response.setHeader('X-API-Build', API_BUILD_DATE)

    return next.handle()
  }
}