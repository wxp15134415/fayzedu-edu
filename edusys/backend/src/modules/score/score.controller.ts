import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Score } from '@/entities'
import { IsNumber, IsOptional, IsString } from 'class-validator'

class CreateScoreDto {
  @IsNumber()
  studentId!: number
  @IsNumber()
  subjectId!: number
  @IsNumber()
  score!: number
  @IsNumber()
  @IsOptional()
  semester?: number
  @IsNumber()
  @IsOptional()
  schoolYear?: number
  @IsString()
  @IsOptional()
  remark?: string
  @IsNumber()
  @IsOptional()
  teacherId?: number
}

@Controller('score')
export class ScoreController {
  constructor(
    @InjectRepository(Score)
    private scoreRepository: Repository<Score>
  ) {}

  @Get('list')
  async findAll(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Query('keyword') keyword: string = ''
  ) {
    const queryBuilder = this.scoreRepository.createQueryBuilder('score')
      .leftJoinAndSelect('score.student', 'student')

    if (keyword) {
      queryBuilder.where(
        'student.name LIKE :keyword OR student.studentNo LIKE :keyword',
        { keyword: `%${keyword}%` }
      )
    }

    queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('score.id', 'DESC')

    const [list, total] = await queryBuilder.getManyAndCount()
    return { list, total, page, pageSize }
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.scoreRepository.findOne({
      where: { id },
      relations: ['student']
    })
  }

  @Post()
  async create(@Body() createDto: CreateScoreDto) {
    const score = this.scoreRepository.create(createDto)
    return this.scoreRepository.save(score)
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() updateDto: Partial<CreateScoreDto>) {
    await this.scoreRepository.update(id, updateDto)
    return this.findOne(id)
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    await this.scoreRepository.delete(id)
    return { message: '删除成功' }
  }
}
