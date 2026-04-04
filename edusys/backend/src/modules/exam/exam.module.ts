import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Exam, Score, ExamSession, ExamArrangement } from '@/entities'
import { ExamController } from './exam.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Exam, Score, ExamSession, ExamArrangement])],
  controllers: [ExamController],
  providers: [],
  exports: []
})
export class ExamModule {}