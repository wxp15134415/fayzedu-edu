import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Subject } from '@/entities'
import { IsString, IsNumber, IsOptional } from 'class-validator'

class CreateSubjectDto {
  @IsString()
  subjectName!: string
  @IsString()
  @IsOptional()
  subjectCode?: string
  @IsNumber()
  @IsOptional()
  credit?: number
  @IsNumber()
  @IsOptional()
  status?: number
  @IsString()
  @IsOptional()
  description?: string
}

@Controller('subject')
export class SubjectController {
  constructor(
    @InjectRepository(Subject)
    private subjectRepository: Repository<Subject>
  ) {}

  @Get('list')
  async findAll(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10
  ) {
    const [list, total] = await this.subjectRepository.findAndCount({
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { id: 'DESC' }
    })
    return { list, total, page, pageSize }
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.subjectRepository.findOne({ where: { id } })
  }

  @Post()
  async create(@Body() createDto: CreateSubjectDto) {
    const subject = this.subjectRepository.create(createDto)
    return this.subjectRepository.save(subject)
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() updateDto: Partial<CreateSubjectDto>) {
    await this.subjectRepository.update(id, updateDto)
    return this.findOne(id)
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    // 成绩表不再按科目删除
    await this.subjectRepository.delete(id)
    return { message: '删除成功' }
  }
}