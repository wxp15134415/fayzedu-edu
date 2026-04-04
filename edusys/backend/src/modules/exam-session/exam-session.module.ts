import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ExamSession, ExamArrangement, Student, StudentGroup, SubjectGroup } from '@/entities'
import { ExamSessionService } from './exam-session.service'
import { ExamSessionController } from './exam-session.controller'

@Module({
  imports: [TypeOrmModule.forFeature([ExamSession, ExamArrangement, Student, StudentGroup, SubjectGroup])],
  providers: [ExamSessionService],
  controllers: [ExamSessionController],
  exports: [ExamSessionService]
})
export class ExamSessionModule {}
