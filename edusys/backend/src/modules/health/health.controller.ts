import { Controller, Get } from '@nestjs/common'
import { DataSource } from 'typeorm'

interface HealthResponse {
  status: 'ok' | 'error'
  timestamp: string
  uptime: number
  database: {
    status: 'connected' | 'disconnected'
    responseTime?: number
  }
  memory: {
    used: number
    total: number
    percentage: number
  }
}

@Controller('health')
export class HealthController {
  private readonly startTime = Date.now()

  constructor(private readonly dataSource: DataSource) {}

  @Get()
  async check(): Promise<HealthResponse> {
    const memoryUsage = process.memoryUsage()
    const totalMemory = memoryUsage.heapTotal
    const usedMemory = memoryUsage.heapUsed

    // 检查数据库连接
    let dbStatus: 'connected' | 'disconnected' = 'disconnected'
    let responseTime: number | undefined

    try {
      const start = Date.now()
      await this.dataSource.query('SELECT 1')
      responseTime = Date.now() - start
      dbStatus = 'connected'
    } catch (error) {
      dbStatus = 'disconnected'
    }

    const uptime = Math.floor((Date.now() - this.startTime) / 1000)

    return {
      status: dbStatus === 'connected' ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      uptime,
      database: {
        status: dbStatus,
        responseTime
      },
      memory: {
        used: Math.round(usedMemory / 1024 / 1024), // MB
        total: Math.round(totalMemory / 1024 / 1024), // MB
        percentage: Math.round((usedMemory / totalMemory) * 100)
      }
    }
  }

  @Get('live')
  live() {
    return { status: 'ok' }
  }

  @Get('ready')
  async ready(): Promise<{ status: string }> {
    try {
      await this.dataSource.query('SELECT 1')
      return { status: 'ready' }
    } catch (error) {
      return { status: 'not_ready' }
    }
  }
}
