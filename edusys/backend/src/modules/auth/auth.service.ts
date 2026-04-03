import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcrypt'
import { User } from '@/entities'
import { LoginDto } from './dto/auth.dto'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { username: loginDto.username },
      relations: ['role', 'role.rolePermissions', 'role.rolePermissions.permission']
    })

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误')
    }

    if (user.status !== 1) {
      throw new UnauthorizedException('账号已被禁用')
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password)
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误')
    }

    // 获取权限列表
    const permissions = user.role?.rolePermissions?.map(rp => rp.permission?.permissionCode).filter(Boolean) || []

    // 生成 token
    const payload = { sub: user.id, username: user.username, roleId: user.roleId }
    const token = this.jwtService.sign(payload)

    // 更新最后登录时间
    user.lastLoginTime = new Date()
    await this.userRepository.save(user)

    // 返回用户信息（不含密码）
    const { password, ...userInfo } = user

    return {
      token,
      user: userInfo,
      permissions,
      menus: this.buildMenus(permissions)
    }
  }

  async logout() {
    return { message: '登出成功' }
  }

  async getCurrentUser(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role', 'role.rolePermissions', 'role.rolePermissions.permission']
    })

    if (!user) {
      throw new UnauthorizedException('用户不存在')
    }

    const permissions = user.role?.rolePermissions?.map(rp => rp.permission?.permissionCode).filter(Boolean) || []

    const { password, ...userInfo } = user

    return {
      user: userInfo,
      permissions,
      menus: this.buildMenus(permissions)
    }
  }

  private buildMenus(permissions: string[]) {
    const menus: any[] = []

    // 首页
    menus.push({
      path: '/dashboard',
      name: 'Dashboard',
      meta: { title: '首页' }
    })

    // 系统管理（需要相关权限）
    if (permissions.some(p => ['user:list', 'role:list', 'permission:list', 'system-info:view'].includes(p))) {
      const systemMenus: any = { path: '/system', name: 'System', meta: { title: '系统管理' }, children: [] }

      if (permissions.includes('user:list')) {
        systemMenus.children.push({ path: '/user', name: 'User', meta: { title: '用户管理', permission: 'user:list' } })
      }
      if (permissions.includes('role:list')) {
        systemMenus.children.push({ path: '/role', name: 'Role', meta: { title: '角色管理', permission: 'role:list' } })
      }
      if (permissions.includes('permission:list')) {
        systemMenus.children.push({ path: '/permission', name: 'Permission', meta: { title: '权限组管理', permission: 'permission:list' } })
      }
      if (permissions.includes('system-info:view')) {
        systemMenus.children.push({ path: '/system-info', name: 'SystemInfo', meta: { title: '基础信息', permission: 'system-info:view' } })
      }

      if (systemMenus.children.length > 0) {
        menus.push(systemMenus)
      }
    }

    // 考试管理（需要相关权限）
    if (permissions.some(p => ['exam:list', 'score:list'].includes(p))) {
      const examMenus: any = { path: '/exam', name: 'Exam', meta: { title: '考试管理' }, children: [] }

      if (permissions.includes('exam:list')) {
        examMenus.children.push({ path: '/exam', name: 'ExamList', meta: { title: '考试安排', permission: 'exam:list' } })
      }
      if (permissions.includes('score:list')) {
        examMenus.children.push({ path: '/score', name: 'Score', meta: { title: '成绩管理', permission: 'score:list' } })
      }

      if (examMenus.children.length > 0) {
        menus.push(examMenus)
      }
    }

    // 教务管理（需要相关权限）
    if (permissions.some(p => ['grade:list', 'class:list', 'student:list', 'subject:list'].includes(p))) {
      const eduMenus: any = { path: '/education', name: 'Education', meta: { title: '教务管理' }, children: [] }

      if (permissions.includes('grade:list')) {
        eduMenus.children.push({ path: '/grade', name: 'Grade', meta: { title: '年级管理', permission: 'grade:list' } })
      }
      if (permissions.includes('class:list')) {
        eduMenus.children.push({ path: '/class', name: 'Class', meta: { title: '班级管理', permission: 'class:list' } })
      }
      if (permissions.includes('student:list')) {
        eduMenus.children.push({ path: '/student', name: 'Student', meta: { title: '学生管理', permission: 'student:list' } })
      }
      if (permissions.includes('subject:list')) {
        eduMenus.children.push({ path: '/subject', name: 'Subject', meta: { title: '科目管理', permission: 'subject:list' } })
      }

      if (eduMenus.children.length > 0) {
        menus.push(eduMenus)
      }
    }

    return menus
  }
}