import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Exam, Score, Student } from '@/entities'
import { CreateExamDto, UpdateExamDto } from './dto/exam.dto'
import { IsString, IsNumber, IsOptional } from 'class-validator'

class CreateScoreDto {
  @IsNumber()
  examId!: number
  @IsNumber()
  studentId!: number
  @IsNumber()
  @IsOptional()
  subjectId?: number
  @IsNumber()
  @IsOptional()
  score?: number
  @IsNumber()
  @IsOptional()
  rank?: number
  @IsNumber()
  @IsOptional()
  totalScore?: number
  @IsNumber()
  @IsOptional()
  totalRank?: number
}

@Controller('exam')
export class ExamController {
  constructor(
    @InjectRepository(Exam)
    private examRepository: Repository<Exam>,
    @InjectRepository(Score)
    private scoreRepository: Repository<Score>
  ) {}

  @Get('list')
  async findAll(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10
  ) {
    const [list, total] = await this.examRepository.findAndCount({
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { id: 'DESC' }
    })
    return { list, total, page, pageSize }
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.examRepository.findOne({ where: { id } })
  }

  @Post()
  async create(@Body() createDto: CreateExamDto) {
    const exam = this.examRepository.create(createDto)
    return this.examRepository.save(exam)
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() updateDto: UpdateExamDto) {
    await this.examRepository.update(id, updateDto)
    return this.findOne(id)
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    // 删除考试时同时删除成绩
    await this.scoreRepository.delete({ examId: id })
    await this.examRepository.delete(id)
    return { message: '删除成功' }
  }

  @Get(':id/scores')
  async getExamScores(@Param('id') id: number) {
    return this.scoreRepository.find({
      where: { examId: id },
      relations: ['student', 'subject'],
      order: { totalRank: 'ASC' }
    })
  }

  @Post(':id/scores')
  async addScores(@Param('id') id: number, @Body() scores: CreateScoreDto[]) {
    for (const s of scores) {
      await this.scoreRepository.save({ ...s, examId: id })
    }
    return { message: '成绩导入成功' }
  }
}
