import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Student, Score, Class, Grade } from '@/entities'
import { StudentController } from './student.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Student, Score, Class, Grade])],
  controllers: [StudentController],
  providers: [],
  exports: []
})
export class StudentModule {}