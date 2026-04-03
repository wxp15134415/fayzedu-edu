import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Exam, Score } from '@/entities'
import { ExamController } from './exam.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Exam, Score])],
  controllers: [ExamController],
  providers: [],
  exports: []
})
export class ExamModule {}