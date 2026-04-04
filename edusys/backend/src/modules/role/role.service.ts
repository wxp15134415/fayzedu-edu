import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, In } from 'typeorm'
import { Role, RolePermission } from '@/entities'
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto'

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(RolePermission)
    private rolePermissionRepository: Repository<RolePermission>
  ) {}

  async findAll() {
    const roles = await this.roleRepository.find({
      order: { id: 'ASC' }
    })
    return { list: roles }
  }

  async findOne(id: number) {
    const role = await this.roleRepository.findOne({
      where: { id }
    })
    if (!role) {
      throw new NotFoundException(`角色ID ${id} 不存在`)
    }
    return role
  }

  async create(createRoleDto: CreateRoleDto) {
    const role = this.roleRepository.create(createRoleDto)
    return this.roleRepository.save(role)
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const role = await this.findOne(id)
    Object.assign(role, updateRoleDto)
    return this.roleRepository.save(role)
  }

  async remove(id: number) {
    const role = await this.findOne(id)
    if (Number(role.isSystem) === 1) {
      throw new Error('系统角色不能删除')
    }
    // 先删除角色权限关联
    await this.rolePermissionRepository.delete({ roleId: id })
    await this.roleRepository.remove(role)
    return { message: '删除成功' }
  }

  async getPermissions(roleId: number) {
    const rolePermissions = await this.rolePermissionRepository.find({
      where: { roleId },
      relations: ['permission']
    })
    return rolePermissions.map(rp => rp.permission)
  }

  async updatePermissions(roleId: number, permissionIds: number[]) {
    // 获取角色信息
    const role = await this.roleRepository.findOne({ where: { id: roleId } })
    if (!role) {
      throw new Error('角色不存在')
    }

    // 超级管理员权限由系统自动管理，不允许手动修改
    if (role.isSuperAdmin === 1) {
      throw new Error('超级管理员权限由系统自动管理，不允许修改')
    }

    await this.rolePermissionRepository.delete({ roleId })

    const rolePermissions = permissionIds.map(permissionId => {
      return this.rolePermissionRepository.create({ roleId, permissionId })
    })

    await this.rolePermissionRepository.save(rolePermissions)
    return { message: '权限分配成功' }
  }
}