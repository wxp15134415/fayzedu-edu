import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, ILike } from 'typeorm'
import { ExamRoom, ExamArrangement } from '@/entities'

@Injectable()
export class ExamRoomService {
  constructor(
    @InjectRepository(ExamRoom)
    private roomRepository: Repository<ExamRoom>,
    @InjectRepository(ExamArrangement)
    private arrangementRepository: Repository<ExamArrangement>
  ) {}

  async findAll(query: any) {
    const { page = 1, pageSize = 10, keyword, venueId, grade } = query

    // 构建基础查询
    let roomQuery = this.roomRepository.createQueryBuilder('room')
      .leftJoinAndSelect('room.venue', 'venue')
      .orderBy('room.id', 'DESC')

    if (venueId) {
      roomQuery = roomQuery.andWhere('room.venueId = :venueId', { venueId })
    }

    // 年级筛选
    if (grade) {
      roomQuery = roomQuery.andWhere('room.roomName LIKE :grade', { grade: `${grade}%` })
    } else if (keyword) {
      roomQuery = roomQuery.andWhere('room.roomName LIKE :keyword', { keyword: `%${keyword}%` })
    }

    const total = await roomQuery.getCount()
    const list = await roomQuery
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany()

    return { list, total, page, pageSize }
  }

  async findOne(id: number) {
    const room = await this.roomRepository.findOne({
      where: { id },
      relations: ['venue']
    })
    if (!room) {
      throw new NotFoundException('考场不存在')
    }
    return room
  }

  async create(data: Partial<ExamRoom>) {
    const room = this.roomRepository.create(data)
    return this.roomRepository.save(room)
  }

  async update(id: number, data: Partial<ExamRoom>) {
    const room = await this.findOne(id)
    Object.assign(room, data)
    return this.roomRepository.save(room)
  }

  async delete(id: number) {
    const room = await this.findOne(id)

    // 检查是否有编排记录引用该考场，如果有则改为禁用
    const arrangements = await this.arrangementRepository.count({
      where: { roomId: id }
    })

    if (arrangements > 0) {
      // 有编排记录，改为禁用状态
      room.status = 0
      await this.roomRepository.save(room)
      return { message: '该考场已有编排记录，已禁用' }
    }

    await this.roomRepository.delete(id)
    return { message: '删除成功' }
  }

  // 启用考场
  async enable(id: number) {
    const room = await this.findOne(id)
    room.status = 1
    return this.roomRepository.save(room)
  }

  // 批量禁用考场
  async batchDisable(ids: number[]) {
    await this.roomRepository.update(ids, { status: 0 } as any)
    return { message: '批量禁用成功' }
  }
}
