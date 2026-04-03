import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Subject, Score } from '@/entities'
import { SubjectController } from './subject.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Subject, Score])],
  controllers: [SubjectController],
  providers: [],
  exports: []
})
export class SubjectModule {}
