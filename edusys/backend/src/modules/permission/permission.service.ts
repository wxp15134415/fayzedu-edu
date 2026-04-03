import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Permission } from '@/entities'
import { CreatePermissionDto, UpdatePermissionDto } from './dto/permission.dto'

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>
  ) {}

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