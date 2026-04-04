import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SubjectGroup, SubjectGroupSubject, StudentGroup, StudentSubject } from '@/entities'
import { SubjectGroupService } from './subject-group.service'
import { SubjectGroupController } from './subject-group.controller'

@Module({
  imports: [
    TypeOrmModule.forFeature([SubjectGroup, SubjectGroupSubject, StudentGroup, StudentSubject])
  ],
  controllers: [SubjectGroupController],
  providers: [SubjectGroupService],
  exports: [SubjectGroupService]
})
export class SubjectGroupModule {}