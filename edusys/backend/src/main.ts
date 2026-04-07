import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { JwtAuthGuard } from './modules/auth/auth.guard'
import { GlobalExceptionFilter } from './filters/global-exception.filter'
import { LoggingInterceptor } from './interceptors/logging.interceptor'
import { VersionInterceptor, API_VERSION, API_BUILD_DATE } from './interceptors/version.interceptor'
import { OperationLogInterceptor } from './interceptors/operation-log.interceptor'
import * as express from 'express'

// 获取允许的 CORS 来源
function getCorsOrigin(): string | string[] | boolean {
  const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS

  // 如果没有配置，使用 *
  if (!allowedOrigins) {
    return '*'
  }

  // 分割多个域名
  const origins = allowedOrigins.split(',').map(o => o.trim())

  // 如果只有一个域名，直接返回
  if (origins.length === 1) {
    return origins[0]
  }

  // 返回多个域名数组，NestJS 会检查请求 Origin 是否在列表中
  return origins
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // 全局路由前缀
  app.setGlobalPrefix('api')

  // 启用 CORS
  const corsOrigin = getCorsOrigin()
  const isDevelopment = process.env.NODE_ENV !== 'production'

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    // 生产环境额外安全头
    ...(isDevelopment ? {} : {
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      allowedHeaders: 'Content-Type,Authorization,X-Request-ID',
      maxAge: 86400 // 24小时
    })
  })

  // 增大请求体限制（成绩数据可能很大）
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true, limit: '10mb' }))

  // 全局验证管道 - transformQueryParams允许查询参数
  // 禁用验证管道，避免body被过滤
  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     whitelist: false,
  //     transform: true,
  //     transformOptions: {
  //       enableImplicitConversion: true
  //     }
  //   })
  // )

  // 全局异常过滤器
  app.useGlobalFilters(new GlobalExceptionFilter())

  // 全局日志拦截器
  app.useGlobalInterceptors(new LoggingInterceptor())

  // 全局版本拦截器
  app.useGlobalInterceptors(new VersionInterceptor())

  // 全局操作日志拦截器
  app.useGlobalInterceptors(new OperationLogInterceptor(
    app.get(DataSource)
  ))

  // 打印版本信息
  console.log(`📦 API Version: ${API_VERSION} (${API_BUILD_DATE})`)

  // 全局认证守卫 - 所有路由默认需要认证
  // 使用 app.useGlobalGuards() 注册
  // 注意：需要在每个模块中正确设置 provider

  const port = process.env.PORT || 3000

  // Swagger 文档配置（开发环境）
  if (process.env.NODE_ENV !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('EduSys API')
      .setDescription('学校管理系统 API 文档')
      .setVersion(API_VERSION)
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'JWT'
      )
      .addTag('auth', '认证相关')
      .addTag('user', '用户管理')
      .addTag('student', '学生管理')
      .addTag('teacher', '教师管理')
      .addTag('score', '成绩管理')
      .addTag('exam', '考试管理')
      .build()

    const document = SwaggerModule.createDocument(app, swaggerConfig)
    SwaggerModule.setup('api/docs', app, document)
    console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`)
  }

  await app.listen(port, '0.0.0.0')
  console.log(`🚀 Backend server running on http://0.0.0.0:${port}`)
}
bootstrap()
