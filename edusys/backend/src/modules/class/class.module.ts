import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Class, Student, Score } from '@/entities'
import { ClassController } from './class.controller'
import { ClassService } from './class.service'

@Module({
  imports: [TypeOrmModule.forFeature([Class, Student, Score])],
  controllers: [ClassController],
  providers: [ClassService],
  exports: [ClassService]
})
export class ClassModule {}
