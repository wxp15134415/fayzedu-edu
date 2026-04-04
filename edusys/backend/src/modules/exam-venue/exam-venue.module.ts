import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ExamVenue } from '@/entities'
import { ExamVenueService } from './exam-venue.service'
import { ExamVenueController } from './exam-venue.controller'

@Module({
  imports: [TypeOrmModule.forFeature([ExamVenue])],
  providers: [ExamVenueService],
  controllers: [ExamVenueController],
  exports: [ExamVenueService]
})
export class ExamVenueModule {}