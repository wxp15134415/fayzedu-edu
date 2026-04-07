import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { TeacherService } from './teacher.service'
import { JwtAuthGuard } from '../auth/auth.guard'

@Controller('teacher')
@UseGuards(JwtAuthGuard)
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Get('list')
  async getList(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '20',
    @Query('keyword') keyword?: string
  ) {
    return this.teacherService.findAll(parseInt(page), parseInt(pageSize), keyword)
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.teacherService.findOne(parseInt(id))
  }

  @Post()
  async create(@Body() data: any) {
    return this.teacherService.create(data)
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.teacherService.update(parseInt(id), data)
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.teacherService.delete(parseInt(id))
  }

  @Get('subjects/list')
  async getSubjects() {
    return this.teacherService.getSubjects()
  }
}