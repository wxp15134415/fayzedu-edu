import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ExamArrangement, ExamVenue, ExamRoom, ExamSession, Student, StudentGroup, Exam } from '@/entities'
import { ExamArrangementService } from './exam-arrangement.service'
import { ExamArrangementController } from './exam-arrangement.controller'

@Module({
  imports: [TypeOrmModule.forFeature([ExamArrangement, ExamVenue, ExamRoom, ExamSession, Student, StudentGroup, Exam])],
  providers: [ExamArrangementService],
  controllers: [ExamArrangementController],
  exports: [ExamArrangementService]
})
export class ExamArrangementModule {}