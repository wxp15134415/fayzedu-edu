import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Teacher } from './教师/entities/教师.entity'
import { Student } from './学生/entities/学生.entity'
import { Banji } from './班级/entities/班级.entity'
import { Course } from './课程/entities/课程.entity'
import { Score } from './成绩/entities/成绩.entity'
import { Jiazhang } from './家长/entities/家长.entity'
import { TeacherCourse } from './教师课程/entities/教师课程.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Teacher,
      Student,
      Banji,
      Course,
      Score,
      Jiazhang,
      TeacherCourse,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class 教育Module {}
