import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { randomUUID } from 'crypto'
import { Request, Response } from 'express'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP')

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>()
    const response = context.switchToHttp().getResponse<Response>()

    // 获取或生成请求 ID
    const requestId = (request.headers['x-request-id'] as string) || randomUUID()

    // 将 requestId 写入响应头
    response.setHeader('x-request-id', requestId)

    const { method, url, ip } = request
    const userAgent = request.headers['user-agent'] || ''
    const startTime = Date.now()

    this.logger.log(
      `[${requestId}] ${method} ${url} - Start - ${ip} - ${userAgent.substring(0, 50)}`
    )

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime
          this.logger.log(
            `[${requestId}] ${method} ${url} - ${response.statusCode} - ${duration}ms`
          )
        },
        error: (error) => {
          const duration = Date.now() - startTime
          const statusCode = error.status || 500
          this.logger.error(
            `[${requestId}] ${method} ${url} - ${statusCode} - ${duration}ms - ${error.message}`
          )
        },
      })
    )
  }
}