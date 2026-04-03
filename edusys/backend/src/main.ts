import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
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

  const port = process.env.PORT || 3000
  await app.listen(port, '0.0.0.0')
  console.log(`🚀 Backend server running on http://0.0.0.0:${port}`)
}
bootstrap()