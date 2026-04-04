import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcrypt'
import { User, Menu, Permission } from '@/entities'
import { LoginDto } from './dto/auth.dto'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Menu)
    private menuRepository: Repository<Menu>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
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
    let permissions = user.role?.rolePermissions?.map(rp => rp.permission?.permissionCode).filter(Boolean) || []

    // 超级管理员自动拥有所有权限
    const isSuperAdmin = user.role?.isSuperAdmin === 1
    if (isSuperAdmin) {
      const allPermissions = await this.permissionRepository.find()
      permissions = [...new Set([...permissions, ...allPermissions.map(p => p.permissionCode)])]
    }

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
      menus: await this.buildMenus(permissions)
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

    let permissions = user.role?.rolePermissions?.map(rp => rp.permission?.permissionCode).filter(Boolean) || []

    // 超级管理员自动拥有所有权限
    const isSuperAdmin = user.role?.isSuperAdmin === 1
    if (isSuperAdmin) {
      const allPermissions = await this.permissionRepository.find()
      permissions = [...new Set([...permissions, ...allPermissions.map(p => p.permissionCode)])]
    }

    const { password, ...userInfo } = user

    return {
      user: userInfo,
      permissions,
      menus: await this.buildMenus(permissions)
    }
  }

  private async buildMenus(permissions: string[]) {
    // 从数据库读取菜单
    const menus = await this.menuRepository.find({
      where: { status: 1 },
      order: { sortOrder: 'ASC' }
    })

    // 构建树形结构并根据权限过滤
    const result = this.buildMenuTree(menus, permissions)
    return result
  }

  // 构建菜单树并根据权限过滤
  private buildMenuTree(menus: Menu[], permissions: string[]): any[] {
    const map = new Map<number, any>()
    const roots: any[] = []

    // 转换为带children的结构
    menus.forEach(menu => {
      map.set(menu.id, { ...menu, children: [] })
    })

    // 构建父子关系
    menus.forEach(menu => {
      const node = map.get(menu.id)
      if (menu.parentId === 0) {
        roots.push(node)
      } else {
        const parent = map.get(menu.parentId)
        if (parent) {
          parent.children.push(node)
        }
      }
    })

    // 过滤：有permission的菜单需要用户有对应权限，没有permission的目录默认显示
    const filterMenus = (items: any[]): any[] => {
      return items
        .map(item => {
          // 递归过滤子菜单
          if (item.children && item.children.length > 0) {
            item.children = filterMenus(item.children)
          }
          return item
        })
        .filter(item => {
          // 判断当前菜单是否应该显示
          if (item.children && item.children.length > 0) {
            // 有子菜单的目录：至少要有一个可见的子菜单才显示
            return true
          }
          // 没有子菜单的叶子菜单
          if (!item.permission) {
            // 没有权限要求的菜单直接显示
            return true
          }
          // 有权限要求的菜单，检查用户是否有该权限
          return permissions.includes(item.permission)
        })
    }

    return filterMenus(roots)
  }
}