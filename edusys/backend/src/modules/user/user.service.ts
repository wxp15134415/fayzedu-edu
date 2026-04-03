import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcrypt'
import { User } from '@/entities'
import { CreateUserDto, UpdateUserDto } from './dto/user.dto'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async findAll(page: number = 1, pageSize: number = 10, sortField: string = '', sortOrder: string = '', keyword: string = '') {
    // 构建排序
    const order: any = {}
    if (sortField && sortOrder) {
      order[sortField] = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC'
    } else {
      order.id = 'DESC'
    }

    // 构建搜索条件 - 多字段OR搜索
    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')

    if (keyword) {
      queryBuilder.where(
        'user.username LIKE :keyword OR user.realName LIKE :keyword OR user.phone LIKE :keyword OR user.email LIKE :keyword',
        { keyword: `%${keyword}%` }
      )
    }

    queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy(sortField ? `user.${sortField}` : 'user.id', sortOrder === 'ASC' ? 'ASC' : 'DESC')

    const [list, total] = await queryBuilder.getManyAndCount()

    return {
      list: list.map(user => ({
        ...user,
        roleName: user.role?.roleName
      })),
      total,
      page,
      pageSize
    }
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role']
    })
    if (!user) {
      throw new NotFoundException(`用户ID ${id} 不存在`)
    }
    // 返回包含 roleId 和 roleName 的用户数据
    const result: any = { ...user }
    if (user.role) {
      result.roleId = Number(user.role.id)
      result.roleName = user.role.roleName
    }
    return result
  }

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10)
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword
    })
    return this.userRepository.save(user)
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id)
    Object.assign(user, updateUserDto)
    return this.userRepository.save(user)
  }

  async remove(id: number) {
    const user = await this.findOne(id)
    await this.userRepository.remove(user)
    return { message: '删除成功' }
  }

  async updateStatus(id: number, status: number) {
    const user = await this.findOne(id)
    user.status = status
    return this.userRepository.save(user)
  }

  async findByUsername(username: string) {
    return this.userRepository.findOne({
      where: { username },
      relations: ['role', 'role.rolePermissions', 'role.rolePermissions.permission']
    })
  }
}