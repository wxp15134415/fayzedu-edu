import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { randomUUID } from 'crypto'

interface ErrorResponse {
  code: number
  message: string
  timestamp: string
  path: string
  requestId: string
  details?: any
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    const requestId = (request.headers['x-request-id'] as string) || randomUUID()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let message = '服务器内部错误'
    let details: any = undefined

    // 处理 HttpException
    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const exceptionResponse = exception.getResponse()

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as any
        message = responseObj.message || message
        details = responseObj.details || responseObj.error
      }
    }
    // 处理自定义错误
    else if (exception instanceof Error) {
      message = exception.message

      // 区分不同类型的错误
      if (message.includes('not found') || message.includes('不存在')) {
        status = HttpStatus.NOT_FOUND
      } else if (message.includes('validation') || message.includes('验证')) {
        status = HttpStatus.BAD_REQUEST
      } else if (message.includes('unauthorized') || message.includes('未授权')) {
        status = HttpStatus.UNAUTHORIZED
      } else if (message.includes('forbidden') || message.includes('禁止')) {
        status = HttpStatus.FORBIDDEN
      }
    }

    // 记录错误日志
    const errorLog: any = {
      requestId,
      method: request.method,
      url: request.url,
      status,
      message,
      timestamp: new Date().toISOString(),
    }

    // 开发环境添加详细信息
    if (process.env.NODE_ENV !== 'production') {
      errorLog.stack = exception instanceof Error ? exception.stack : undefined
      errorLog.details = details
    }

    // 根据状态码决定日志级别
    if (status >= 500) {
      this.logger.error(JSON.stringify(errorLog))
    } else if (status >= 400) {
      this.logger.warn(JSON.stringify(errorLog))
    }

    // 构建响应
    const errorResponse: ErrorResponse = {
      code: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId,
    }

    if (details && process.env.NODE_ENV !== 'production') {
      errorResponse.details = details
    }

    response.status(status).json(errorResponse)
  }
}