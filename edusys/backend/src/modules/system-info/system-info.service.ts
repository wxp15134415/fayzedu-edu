import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { SystemInfo, User, Student, Grade, Class, Subject, Role, Permission, Score } from '@/entities'
import { UpdateSystemInfoDto } from './dto/system-info.dto'

@Injectable()
export class SystemInfoService {
  constructor(
    @InjectRepository(SystemInfo)
    private systemInfoRepository: Repository<SystemInfo>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Grade)
    private gradeRepository: Repository<Grade>,
    @InjectRepository(Class)
    private classRepository: Repository<Class>,
    @InjectRepository(Subject)
    private subjectRepository: Repository<Subject>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(Score)
    private scoreRepository: Repository<Score>
  ) {}

  async get() {
    let info = await this.systemInfoRepository.findOne({ where: { id: 1 } })
    if (!info) {
      // 首次创建默认数据
      info = await this.systemInfoRepository.save({
        id: 1,
        schoolName: '学校管理系统',
        currentYear: '2025-2026',
        currentSemester: 1,
        address: '',
        phone: '',
        email: ''
      })
    }
    return info
  }

  async update(updateDto: UpdateSystemInfoDto) {
    const info = await this.get()
    Object.assign(info, updateDto)
    return this.systemInfoRepository.save(info)
  }

  async getStatistics() {
    const [users, totalUsers] = await this.userRepository.findAndCount()
    const [students, totalStudents] = await this.studentRepository.findAndCount({ where: { status: 1 } })
    const [grades, totalGrades] = await this.gradeRepository.findAndCount()
    const [classes, totalClasses] = await this.classRepository.findAndCount()
    const [subjects, totalSubjects] = await this.subjectRepository.findAndCount()
    const [scores, totalScores] = await this.scoreRepository.findAndCount()
    const [roles, totalRoles] = await this.roleRepository.findAndCount()
    const [permissions, totalPermissions] = await this.permissionRepository.findAndCount()

    return {
      totalUsers,
      totalStudents,
      totalGrades,
      totalClasses,
      totalSubjects,
      totalScores,
      totalRoles,
      totalPermissions
    }
  }
}