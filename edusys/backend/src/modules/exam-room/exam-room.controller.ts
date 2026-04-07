import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ExamRoomService } from './exam-room.service'
import { JwtAuthGuard } from '../auth/auth.guard'

@Controller('exam-room')
@UseGuards(JwtAuthGuard)
export class ExamRoomController {
  constructor(private readonly examRoomService: ExamRoomService) {}

  @Get('list')
  async findAll(@Query() query: any) {
    return this.examRoomService.findAll(query)
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.examRoomService.findOne(+id)
  }

  @Post()
  async create(@Body() data: any) {
    return this.examRoomService.create(data)
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.examRoomService.update(+id, data)
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.examRoomService.delete(+id)
  }

  @Put('enable/:id')
  async enable(@Param('id') id: string) {
    return this.examRoomService.enable(+id)
  }

  @Post('batch-disable')
  async batchDisable(@Body() body: { ids: number[] }) {
    return this.examRoomService.batchDisable(body.ids)
  }
}
