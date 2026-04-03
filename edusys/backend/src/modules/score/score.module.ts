import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Score } from '@/entities'
import { ScoreController } from './score.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Score])],
  controllers: [ScoreController],
  providers: [],
  exports: []
})
export class ScoreModule {}