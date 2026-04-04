import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // 全局路由前缀
  app.setGlobalPrefix('api')

  // 启用 CORS
  app.enableCors({
    origin: '*',
    credentials: true
  })

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true
    })
  )

  // 初始化种子数据 - 使用 TypeORM 的 onModuleInit
  // 种子数据会在 MenuService 首次被调用时自动初始化

  const port = process.env.PORT || 3000
  await app.listen(port, '0.0.0.0')
  console.log(`🚀 Backend server running on http://0.0.0.0:${port}`)
}
bootstrap()