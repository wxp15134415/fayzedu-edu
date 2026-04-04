import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common'
import { ExamArrangementService } from './exam-arrangement.service'

@Controller('exam-arrangement')
export class ExamArrangementController {
  constructor(private readonly examArrangementService: ExamArrangementService) {}

  @Get('list')
  async findAll(@Query() query: any) {
    return this.examArrangementService.findAll(query)
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.examArrangementService.findOne(+id)
  }

  @Post()
  async create(@Body() data: any) {
    return this.examArrangementService.create(data)
  }

  @Post('arrange')
  async arrangeStudents(@Body() data: any) {
    return this.examArrangementService.arrangeStudents(data)
  }

  @Post('available-students')
  async getAvailableStudents(@Body() data: any) {
    return this.examArrangementService.getAvailableStudents(data.examId, data.sessionId, data.gradeId)
  }

  @Get('print-data/:examId/:sessionId')
  async getPrintData(@Param('examId') examId: string, @Param('sessionId') sessionId: string) {
    return this.examArrangementService.getPrintData(+examId, +sessionId)
  }

  @Post('mark-printed')
  async markPrinted(@Body() data: { ids: number[] }) {
    return this.examArrangementService.markPrinted(data.ids)
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.examArrangementService.update(+id, data)
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.examArrangementService.delete(+id)
  }

  @Post('batch-delete')
  async batchDelete(@Body() data: { ids: number[] }) {
    return this.examArrangementService.batchDelete(data.ids)
  }

  // ==================== 扩展API ====================

  @Post('auto-arrange')
  async autoArrange(@Body() data: { examId: number; venueId?: number }) {
    return this.examArrangementService.autoArrange(data.examId, data.venueId)
  }

  @Post('random-seat')
  async randomizeSeatNumbers(@Body() data: { examId: number; sessionId?: number }) {
    return this.examArrangementService.randomizeSeatNumbers(data.examId, data.sessionId)
  }

  @Get('detect-conflicts/:examId')
  async detectConflicts(@Param('examId') examId: string) {
    return this.examArrangementService.detectConflicts(+examId)
  }

  @Post('manual-adjust/:id')
  async manualAdjust(@Param('id') id: string, @Body() data: any) {
    return this.examArrangementService.manualAdjust(+id, data)
  }

  @Get('preview/:examId')
  async preview(@Param('examId') examId: string) {
    return this.examArrangementService.preview(+examId)
  }

  @Get('export-tickets/:examId')
  async exportTickets(
    @Param('examId') examId: string,
    @Query('sessionId') sessionId?: string
  ) {
    return this.examArrangementService.exportTickets(
      +examId,
      sessionId ? +sessionId : undefined
    )
  }

  @Get('export-room-seats/:examId/:sessionId')
  async exportRoomSeats(
    @Param('examId') examId: string,
    @Param('sessionId') sessionId: string
  ) {
    return this.examArrangementService.exportRoomSeats(+examId, +sessionId)
  }
}
