import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, In } from 'typeorm'
import { Exam, Score, ExamSession, ExamArrangement } from '@/entities'
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
    private scoreRepository: Repository<Score>,
    @InjectRepository(ExamSession)
    private sessionRepository: Repository<ExamSession>,
    @InjectRepository(ExamArrangement)
    private arrangementRepository: Repository<ExamArrangement>
  ) {}

  @Get('list')
  async findAll(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10
  ) {
    const [list, total] = await this.examRepository.findAndCount({
      skip: (page - 1) * pageSize,
      take: pageSize,
      relations: ['grade'],
      order: { id: 'DESC' }
    })
    // 格式化年级名称
    const formattedList = list.map(item => ({
      ...item,
      gradeName: item.grade?.gradeName || ''
    }))
    return { list: formattedList, total, page, pageSize }
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
    // 删除考试时同时删除关联数据
    // 1. 删除成绩
    await this.scoreRepository.delete({ examId: id })
    // 2. 获取该考试的所有场次
    const sessions = await this.sessionRepository.find({ where: { examId: id } })
    const sessionIds = sessions.map(s => s.id)
    // 3. 删除编排记录
    if (sessionIds.length > 0) {
      await this.arrangementRepository.delete({ sessionId: In(sessionIds) })
    }
    // 4. 删除场次
    await this.sessionRepository.delete({ examId: id })
    // 5. 删除考试
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
