import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Menu } from '@/entities'

@Injectable()
export class MenuService implements OnModuleInit {
  constructor(
    @InjectRepository(Menu)
    private menuRepository: Repository<Menu>
  ) {}

  async onModuleInit() {
    await this.seedMenus()
  }

  private async seedMenus() {
    const count = await this.menuRepository.count()
    if (count > 0) {
      console.log('菜单数据已存在，跳过初始化')
      return
    }

    const menus = [
      { name: '首页', path: '/dashboard', parentId: 0, sortOrder: 1, icon: 'HomeFilled', permission: '', type: 'menu', status: 1 },
      { name: '系统管理', path: '/system', parentId: 0, sortOrder: 2, icon: 'Setting', permission: '', type: 'menu', status: 1 },
      { name: '用户管理', path: '/user', parentId: 2, sortOrder: 1, icon: '', permission: 'user:list', type: 'menu', status: 1 },
      { name: '角色管理', path: '/role', parentId: 2, sortOrder: 2, icon: '', permission: 'role:list', type: 'menu', status: 1 },
      { name: '权限管理', path: '/permission', parentId: 2, sortOrder: 3, icon: '', permission: 'permission:list', type: 'menu', status: 1 },
      { name: '菜单管理', path: '/menu', parentId: 2, sortOrder: 4, icon: '', permission: 'menu:list', type: 'menu', status: 1 },
      { name: '基础信息', path: '/system-info', parentId: 2, sortOrder: 5, icon: '', permission: 'system-info:view', type: 'menu', status: 1 },
      { name: '考试管理', path: '/exam', parentId: 0, sortOrder: 3, icon: 'Calendar', permission: '', type: 'menu', status: 1 },
      { name: '考试安排', path: '/exam', parentId: 3, sortOrder: 1, icon: '', permission: 'exam:list', type: 'menu', status: 1 },
      { name: '考试场次', path: '/exam-session', parentId: 3, sortOrder: 2, icon: '', permission: 'exam-session:list', type: 'menu', status: 1 },
      { name: '考点管理', path: '/exam-venue', parentId: 3, sortOrder: 3, icon: '', permission: 'exam-venue:list', type: 'menu', status: 1 },
      { name: '考场管理', path: '/exam-room', parentId: 3, sortOrder: 4, icon: '', permission: 'exam-room:list', type: 'menu', status: 1 },
      { name: '考试编排', path: '/exam-arrangement', parentId: 3, sortOrder: 5, icon: '', permission: 'exam-arrangement:list', type: 'menu', status: 1 },
      { name: '成绩管理', path: '/score', parentId: 3, sortOrder: 6, icon: '', permission: 'score:list', type: 'menu', status: 1 },
      { name: '教务管理', path: '/education', parentId: 0, sortOrder: 4, icon: 'Reading', permission: '', type: 'menu', status: 1 },
      { name: '年级管理', path: '/grade', parentId: 4, sortOrder: 1, icon: '', permission: 'grade:list', type: 'menu', status: 1 },
      { name: '班级管理', path: '/class', parentId: 4, sortOrder: 2, icon: '', permission: 'class:list', type: 'menu', status: 1 },
      { name: '学生管理', path: '/student', parentId: 4, sortOrder: 3, icon: '', permission: 'student:list', type: 'menu', status: 1 },
      { name: '科目管理', path: '/subject', parentId: 4, sortOrder: 4, icon: '', permission: 'subject:list', type: 'menu', status: 1 },
    ]

    await this.menuRepository.save(menus)
    console.log('菜单数据初始化完成')
  }

  async findAll(query: { page?: number; pageSize?: number; keyword?: string }) {
    const { page = 1, pageSize = 100, keyword = '' } = query

    const queryBuilder = this.menuRepository.createQueryBuilder('menu')

    if (keyword) {
      queryBuilder.where('menu.name LIKE :keyword OR menu.path LIKE :keyword', {
        keyword: `%${keyword}%`
      })
    }

    queryBuilder
      .orderBy('menu.sortOrder', 'ASC')
      .skip((page - 1) * pageSize)
      .take(pageSize)

    const [list, total] = await queryBuilder.getManyAndCount()
    return { list, total, page, pageSize }
  }

  async findTree() {
    const menus = await this.menuRepository.find({
      order: { sortOrder: 'ASC' }
    })
    return this.buildTree(menus)
  }

  async findOne(id: number) {
    const menu = await this.menuRepository.findOne({ where: { id } })
    if (!menu) {
      throw new NotFoundException('菜单不存在')
    }
    return menu
  }

  async create(createDto: Partial<Menu>) {
    const menu = this.menuRepository.create(createDto)
    return this.menuRepository.save(menu)
  }

  async update(id: number, updateDto: Partial<Menu>) {
    const menu = await this.findOne(id)
    Object.assign(menu, updateDto)
    return this.menuRepository.save(menu)
  }

  async remove(id: number) {
    // 检查是否有子菜单
    const children = await this.menuRepository.find({ where: { parentId: id } })
    if (children.length > 0) {
      // 先删除所有子菜单
      for (const child of children) {
        await this.remove(child.id)
      }
    }
    const menu = await this.findOne(id)
    await this.menuRepository.remove(menu)
    return { message: '删除成功' }
  }

  // 获取所有叶子节点的权限代码
  async getPermissions() {
    const menus = await this.menuRepository.find({
      where: { status: 1, type: 'menu' }
    })
    const permissions: string[] = []
    for (const menu of menus) {
      if (menu.permission) {
        permissions.push(menu.permission)
      }
    }
    return [...new Set(permissions)]
  }

  // 构建树形结构
  private buildTree(menus: Menu[]): any[] {
    const map = new Map<number, any>()
    const roots: any[] = []

    // 先转换为带children的结构
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

    return roots
  }
}