import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { Request, Response } from 'express'
import { DataSource } from 'typeorm'
import { OperationLog } from '../entities'

@Injectable()
export class OperationLogInterceptor {
  constructor(private readonly dataSource: DataSource) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>()
    const response = context.switchToHttp().getResponse<Response>()

    // 只记录需要关注的操作
    const method = request.method
    const path = request.path
    const isHealthCheck = path.includes('/health')
    const isAuth = path.includes('/auth/login')

    // 跳过健康检查和登录接口
    if (isHealthCheck || isAuth) {
      return next.handle()
    }

    const startTime = Date.now()
    const user = (request as any).user
    const ip = (request.ip as string) || (request.headers['x-forwarded-for'] as string) || 'unknown'
    const userAgent = request.headers['user-agent'] || ''

    // 从路径提取模块名
    const pathParts = path.replace('/api/', '').split('/')
    const module = pathParts[0] || 'unknown'

    return next.handle().pipe(
      tap({
        next: async (data) => {
          const duration = Date.now() - startTime

          // 记录成功操作
          await this.logOperation({
            userId: user?.id || 0,
            userName: user?.username || 'anonymous',
            module,
            operation: this.getOperationType(method),
            method,
            path,
            requestBody: this.sanitizeBody(request.body),
            statusCode: response.statusCode,
            ip,
            userAgent,
            duration,
            errorMsg: undefined,
            extra: this.extractExtra(path, data)
          })
        },
        error: async (error) => {
          const duration = Date.now() - startTime

          // 记录失败操作
          await this.logOperation({
            userId: user?.id || 0,
            userName: user?.username || 'anonymous',
            module,
            operation: this.getOperationType(method),
            method,
            path,
            requestBody: this.sanitizeBody(request.body),
            statusCode: response.statusCode || 500,
            ip,
            userAgent,
            duration,
            errorMsg: error.message || 'Unknown error',
            extra: undefined
          })
        },
      })
    )
  }

  private getOperationType(method: string): string {
    const operationMap: Record<string, string> = {
      GET: 'view',
      POST: 'create',
      PUT: 'update',
      PATCH: 'update',
      DELETE: 'delete'
    }
    return operationMap[method] || 'unknown'
  }

  private sanitizeBody(body: any): string | null {
    if (!body) return null

    // 移除敏感字段 - 使用深拷贝避免修改原始body
    const sanitized = JSON.parse(JSON.stringify(body))
    const sensitiveFields = ['password', 'token', 'secret', 'authorization']

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***'
      }
    }

    // 限制长度
    const str = JSON.stringify(sanitized)
    return str.length > 2000 ? str.substring(0, 2000) + '...' : str
  }

  private extractExtra(path: string, data: any): Record<string, any> | null {
    // 根据路径提取额外信息
    if (path.includes('/import') && data?.success) {
      return { importedCount: data.data?.success || 0 }
    }
    if (path.includes('/export')) {
      return { exportedCount: data?.length || 0 }
    }
    return null
  }

  private async logOperation(log: {
    userId: number
    userName: string
    module: string
    operation: string
    method: string
    path: string
    requestBody: string | null | undefined
    statusCode: number
    ip: string
    userAgent: string
    duration: number
    errorMsg: string | null | undefined
    extra: Record<string, any> | null | undefined
  }): Promise<void> {
    try {
      // 使用原始查询避免类型问题
      await this.dataSource.query(
        `INSERT INTO operation_log (
          user_id, user_name, module, operation, method, path,
          request_body, status_code, ip, user_agent, duration,
          error_msg, extra, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())`,
        [
          log.userId,
          log.userName,
          log.module,
          log.operation,
          log.method,
          log.path,
          log.requestBody || null,
          log.statusCode,
          log.ip,
          log.userAgent,
          log.duration,
          log.errorMsg || null,
          log.extra ? JSON.stringify(log.extra) : null
        ]
      )
    } catch (error) {
      // 日志记录失败不应影响主业务
      console.error('Failed to save operation log:', error)
    }
  }
}