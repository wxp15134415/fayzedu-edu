import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ExamSessionService } from './exam-session.service'
import { JwtAuthGuard } from '../auth/auth.guard'

@Controller('exam-session')
@UseGuards(JwtAuthGuard)
export class ExamSessionController {
  constructor(private readonly examSessionService: ExamSessionService) {}

  @Get('list')
  async findAll(@Query() query: any) {
    return this.examSessionService.findAll(query)
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.examSessionService.findOne(+id)
  }

  @Post()
  async create(@Body() data: any) {
    return this.examSessionService.create(data)
  }

  @Post('batch')
  async batchCreate(@Body() data: { examId: number; sessions: any[] }) {
    return this.examSessionService.batchCreate(data.examId, data.sessions)
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.examSessionService.update(+id, data)
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.examSessionService.delete(+id)
  }

  @Get('by-exam/:examId')
  async getByExam(@Param('examId') examId: string) {
    return this.examSessionService.findAll({ examId: +examId, pageSize: 100 })
  }

  @Put('by-exam/:examId')
  async updateByExam(@Param('examId') examId: string, @Body() body: any) {
    const subjectList = body.subjectList || body || []
    return this.examSessionService.updateByExam(+examId, subjectList)
  }

  // ==================== 扩展API ====================

  @Get(':id/available-students')
  async getAvailableStudents(
    @Param('id') id: string,
    @Query('gradeId') gradeId?: string
  ) {
    return this.examSessionService.getAvailableStudents(
      +id,
      gradeId ? +gradeId : undefined
    )
  }

  @Get(':id/arranged-count')
  async getArrangedCount(@Param('id') id: string) {
    const count = await this.examSessionService.getArrangedCount(+id)
    return { sessionId: +id, count }
  }

  @Post('check-conflicts')
  async checkConflicts(@Body() body: { examId: number; studentIds: number[] }) {
    return this.examSessionService.checkConflicts(body.examId, body.studentIds)
  }

  @Get('check-capacity/:examId')
  async checkCapacity(
    @Param('examId') examId: string,
    @Query('sessionId') sessionId?: string
  ) {
    return this.examSessionService.checkCapacity(
      +examId,
      sessionId ? +sessionId : undefined
    )
  }
}
