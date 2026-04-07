import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common'
import { SystemInfoService } from './system-info.service'
import { UpdateSystemInfoDto } from './dto/system-info.dto'
import { JwtAuthGuard } from '../auth/auth.guard'

@Controller('system-info')
@UseGuards(JwtAuthGuard)
export class SystemInfoController {
  constructor(private readonly systemInfoService: SystemInfoService) {}

  @Get()
  async get() {
    return this.systemInfoService.get()
  }

  @Put()
  async update(@Body() updateDto: UpdateSystemInfoDto) {
    return this.systemInfoService.update(updateDto)
  }

  @Get('statistics')
  async getStatistics() {
    return this.systemInfoService.getStatistics()
  }
}
