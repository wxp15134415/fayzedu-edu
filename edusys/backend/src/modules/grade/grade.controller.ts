import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common'
import { GradeService } from './grade.service'
import { CreateGradeDto, UpdateGradeDto } from './dto/grade.dto'

@Controller('grade')
export class GradeController {
  constructor(private readonly gradeService: GradeService) {}

  @Get('list')
  async findAll(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10
  ) {
    return this.gradeService.findAll(+page, +pageSize)
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.gradeService.findOne(+id)
  }

  @Post()
  async create(@Body() createGradeDto: CreateGradeDto) {
    return this.gradeService.create(createGradeDto)
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() updateGradeDto: UpdateGradeDto) {
    return this.gradeService.update(+id, updateGradeDto)
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.gradeService.remove(+id)
  }
}