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

    return menus
  }
}