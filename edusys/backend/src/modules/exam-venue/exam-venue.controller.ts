import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ExamVenueService } from './exam-venue.service'
import { JwtAuthGuard } from '../auth/auth.guard'

@Controller('exam-venue')
@UseGuards(JwtAuthGuard)
export class ExamVenueController {
  constructor(private readonly examVenueService: ExamVenueService) {}

  @Get('list')
  async findAll(@Query() query: any) {
    return this.examVenueService.findAll(query)
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.examVenueService.findOne(+id)
  }

  @Post()
  async create(@Body() data: any) {
    return this.examVenueService.create(data)
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.examVenueService.update(+id, data)
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.examVenueService.delete(+id)
  }
}
