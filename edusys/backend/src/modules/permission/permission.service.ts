import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Permission } from '@/entities'
import { CreatePermissionDto, UpdatePermissionDto } from './dto/permission.dto'

@Injectable()
export class PermissionService implements OnModuleInit {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>
  ) {}

  async onModuleInit() {
    await this.seedPermissions()
  }

  private async seedPermissions() {
    const count = await this.permissionRepository.count()
    if (count > 0) {
      console.log('权限数据已存在，跳过初始化')
      return
    }

    const permissions = [
      { permissionName: '查看首页', permissionCode: 'dashboard:view', permissionDesc: '查看首页' },
      { permissionName: '用户管理', permissionCode: 'user:list', permissionDesc: '用户管理' },
      { permissionName: '角色管理', permissionCode: 'role:list', permissionDesc: '角色管理' },
      { permissionName: '权限管理', permissionCode: 'permission:list', permissionDesc: '权限管理' },
      { permissionName: '菜单管理', permissionCode: 'menu:list', permissionDesc: '菜单管理' },
      { permissionName: '基础信息', permissionCode: 'system-info:view', permissionDesc: '基础信息' },
      { permissionName: '考试安排', permissionCode: 'exam:list', permissionDesc: '考试安排' },
      { permissionName: '考试场次', permissionCode: 'exam-session:list', permissionDesc: '考试场次' },
      { permissionName: '考点管理', permissionCode: 'exam-venue:list', permissionDesc: '考点管理' },
      { permissionName: '考场管理', permissionCode: 'exam-room:list', permissionDesc: '考场管理' },
      { permissionName: '考试编排', permissionCode: 'exam-arrangement:list', permissionDesc: '考试编排' },
      { permissionName: '成绩管理', permissionCode: 'score:list', permissionDesc: '成绩管理' },
      { permissionName: '年级管理', permissionCode: 'grade:list', permissionDesc: '年级管理' },
      { permissionName: '班级管理', permissionCode: 'class:list', permissionDesc: '班级管理' },
      { permissionName: '学生管理', permissionCode: 'student:list', permissionDesc: '学生管理' },
      { permissionName: '科目管理', permissionCode: 'subject:list', permissionDesc: '科目管理' },
    ]

    await this.permissionRepository.save(permissions)
    console.log('权限数据初始化完成')
  }

  async findAll() {
    const permissions = await this.permissionRepository.find({
      order: { id: 'ASC' }
    })
    return { list: permissions }
  }

  async findOne(id: number) {
    const permission = await this.permissionRepository.findOne({
      where: { id }
    })
    if (!permission) {
      throw new NotFoundException(`权限组ID ${id} 不存在`)
    }
    return permission
  }

  async create(createPermissionDto: CreatePermissionDto) {
    const permission = this.permissionRepository.create(createPermissionDto)
    return this.permissionRepository.save(permission)
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto) {
    const permission = await this.findOne(id)
    Object.assign(permission, updatePermissionDto)
    return this.permissionRepository.save(permission)
  }

  async remove(id: number) {
    const permission = await this.findOne(id)
    await this.permissionRepository.remove(permission)
    return { message: '删除成功' }
  }
}