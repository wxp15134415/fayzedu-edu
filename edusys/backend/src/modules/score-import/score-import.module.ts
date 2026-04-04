import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ScoreImportController } from './score-import.controller'
import { Student, ScoreImportTemp, Exam, Score, Class, Grade } from '@/entities'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Student,
      ScoreImportTemp,
      Exam,
      Score,
      Class,
      Grade
    ])
  ],
  controllers: [ScoreImportController],
  providers: []
})
export class ScoreImportModule {}