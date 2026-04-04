import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ImportService } from './import.service'
import { ImportController } from './import.controller'
import { ImportTemp } from '../../entities/import-temp.entity'

@Module({
  imports: [TypeOrmModule.forFeature([ImportTemp])],
  controllers: [ImportController],
  providers: [ImportService],
  exports: [ImportService]
})
export class ImportModule {}