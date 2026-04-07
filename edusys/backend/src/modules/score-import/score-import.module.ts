import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ScoreImportController } from './score-import.controller'
import { Student, ScoreImportTemp, Exam, Score, Class, Grade, ExamScore } from '@/entities'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Student,
      ScoreImportTemp,
      Exam,
      Score,
      Class,
      Grade,
      ExamScore
    ])
  ],
  controllers: [ScoreImportController],
  providers: []
})
export class ScoreImportModule {}