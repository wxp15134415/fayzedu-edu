import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ExamRoom, ExamArrangement } from '@/entities'
import { ExamRoomService } from './exam-room.service'
import { ExamRoomController } from './exam-room.controller'

@Module({
  imports: [TypeOrmModule.forFeature([ExamRoom, ExamArrangement])],
  providers: [ExamRoomService],
  controllers: [ExamRoomController],
  exports: [ExamRoomService]
})
export class ExamRoomModule {}