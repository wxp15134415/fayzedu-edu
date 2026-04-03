import { Controller, Get, Put, Body } from '@nestjs/common'
import { SystemInfoService } from './system-info.service'
import { UpdateSystemInfoDto } from './dto/system-info.dto'

@Controller('system-info')
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
