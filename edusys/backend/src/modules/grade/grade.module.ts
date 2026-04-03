import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Grade, Class, Student, Score } from '@/entities'
import { GradeController } from './grade.controller'
import { GradeService } from './grade.service'

@Module({
  imports: [TypeOrmModule.forFeature([Grade, Class, Student, Score])],
  controllers: [GradeController],
  providers: [GradeService],
  exports: [GradeService]
})
export class GradeModule {}