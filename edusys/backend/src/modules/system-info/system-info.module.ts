import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SystemInfo, User, Student, Grade, Class, Subject, Role, Permission, Score } from '@/entities'
import { SystemInfoController } from './system-info.controller'
import { SystemInfoService } from './system-info.service'

@Module({
  imports: [TypeOrmModule.forFeature([SystemInfo, User, Student, Grade, Class, Subject, Role, Permission, Score])],
  controllers: [SystemInfoController],
  providers: [SystemInfoService],
  exports: [SystemInfoService]
})
export class SystemInfoModule {}
