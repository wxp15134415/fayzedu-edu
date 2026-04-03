import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PassportModule } from '@nestjs/passport'
import { AuthModule } from './modules/auth/auth.module'
import { UserModule } from './modules/user/user.module'
import { RoleModule } from './modules/role/role.module'
import { PermissionModule } from './modules/permission/permission.module'
import { GradeModule } from './modules/grade/grade.module'
import { ClassModule } from './modules/class/class.module'
import { StudentModule } from './modules/student/student.module'
import { ScoreModule } from './modules/score/score.module'
import { SubjectModule } from './modules/subject/subject.module'
import { SystemInfoModule } from './modules/system-info/system-info.module'
import { ExamModule } from './modules/exam/exam.module'
import { ExamVenueModule } from './modules/exam-venue/exam-venue.module'
import { ExamRoomModule } from './modules/exam-room/exam-room.module'
import { ExamSessionModule } from './modules/exam-session/exam-session.module'
import { ExamArrangementModule } from './modules/exam-arrangement/exam-arrangement.module'
import { User, Role, Permission, RolePermission, Grade, Class, Student, Exam, Score, Subject, SystemInfo, ExamVenue, ExamRoom, ExamSession, ExamArrangement } from './entities'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST') || 'localhost',
        port: configService.get('DB_PORT') || 5432,
        username: configService.get('DB_USERNAME') || 'wangxiaoping',
        password: configService.get('DB_PASSWORD') || '',
        database: configService.get('DB_DATABASE') || 'edusys',
        entities: [User, Role, Permission, RolePermission, Grade, Class, Student, Exam, Score, Subject, SystemInfo, ExamVenue, ExamRoom, ExamSession, ExamArrangement],
        synchronize: true,
        logging: false
      })
    }),
    AuthModule,
    UserModule,
    RoleModule,
    PermissionModule,
    GradeModule,
    ClassModule,
    StudentModule,
    ScoreModule,
    SubjectModule,
    SystemInfoModule,
    ExamModule,
    ExamVenueModule,
    ExamRoomModule,
    ExamSessionModule,
    ExamArrangementModule
  ]
})
export class AppModule {}