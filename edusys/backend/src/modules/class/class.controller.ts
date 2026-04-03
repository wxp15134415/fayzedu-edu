import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common'
import { ClassService } from './class.service'
import { CreateClassDto, UpdateClassDto } from './dto/class.dto'

@Controller('class')
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @Get('list')
  async findAll(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10
  ) {
    return this.classService.findAll(+page, +pageSize)
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.classService.findOne(+id)
  }

  @Post()
  async create(@Body() createClassDto: CreateClassDto) {
    return this.classService.create(createClassDto)
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() updateClassDto: UpdateClassDto) {
    return this.classService.update(+id, updateClassDto)
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.classService.remove(+id)
  }
}